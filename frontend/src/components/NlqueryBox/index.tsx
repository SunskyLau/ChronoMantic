import { useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import "./index.css";
import { insertTreeData, setCurrentFragments, setFragments, setNLQuery, setQuerySpec, setRatio } from "../../app/slice/stateSlice";
import { getFragmentsByTimeGranularity, getQueryResult, getQuerySpecRequest, getScaleRatio } from "../../api";
import { getColor } from "../../utils/color";
import { flushSync } from "react-dom";
import QueryIcon from "../../icons/Query";
import SubmitIcon from "../../icons/Submit";
import { FragmentList } from "../../types/QuerySpec";

export default function NlqueryBox() {
  const inputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const NLQuery = useAppSelector((state) => state.states.NLQuery);
  const datasetName = useAppSelector((state) => state.dataset.dataset?.datasetName);
  const timeStampColumnName = useAppSelector((state) => state.dataset.dataset?.timeStampColumnName);
  const isRequesting = useAppSelector((state) => state.results.isRequesting);
  const trend = useAppSelector((state) => state.results.trend);
  const querySpec = useAppSelector((state) => state.states.querySpec);
  const isFirstQuery = !querySpec;
  const ratio = useAppSelector((state) => state.states.ratio);
  const currentFragments = useAppSelector((state) => state.states.currentFragments);
  const [isEdit, setIsEdit] = useState(false);

  const PLACEHOLDER = "Please enter your query...";
  let coloredText = NLQuery.replace(/ /g, "&nbsp;");
  trend.forEach((item, index) => {
    const regex = new RegExp(item.replace(/ /g, "&nbsp;"), 'gi');
    coloredText = coloredText.replace(regex, (match) => {
      return `<b style="background-color: ${getColor(index)};">${match}</b>`;
    });
  });

  return (
    <form className="nl-query-form" onSubmit={async (e) => {
      e.preventDefault();
      if (!datasetName || !NLQuery || !timeStampColumnName) return;
      const curQuerySpec = await getQuerySpecRequest(NLQuery);
      if (!isFirstQuery) {
        if (!curQuerySpec.timeGranularity) curQuerySpec.timeGranularity = querySpec.timeGranularity;
        if (!curQuerySpec.valueColumnName) curQuerySpec.valueColumnName = querySpec.valueColumnName;
        if (!curQuerySpec.patterns?.length) {
          curQuerySpec.patterns = querySpec.patterns;
        } else {
          curQuerySpec.patterns = (querySpec.patterns || []).map((item, index) => {
            return {
              trend: curQuerySpec.patterns?.[index]?.trend || item.trend,
              extent: curQuerySpec.patterns?.[index]?.extent || item.extent
            }
          })
        }
      }
      if (curQuerySpec.valueColumnName && curQuerySpec.timeGranularity) {
        dispatch(setQuerySpec(curQuerySpec));
        let fragmentList: FragmentList | null = null, r: number | null = null;
        if (isFirstQuery || querySpec?.timeGranularity !== curQuerySpec.timeGranularity || !currentFragments) {
          fragmentList = await getFragmentsByTimeGranularity(datasetName, timeStampColumnName, curQuerySpec.valueColumnName, curQuerySpec.timeGranularity);
          dispatch(setFragments(fragmentList));
        }
        if (isFirstQuery || ratio === 1) {
          r = await getScaleRatio(datasetName, timeStampColumnName, curQuerySpec.valueColumnName)
          dispatch(setRatio(r));
        }
        const results = await getQueryResult(curQuerySpec, fragmentList! || currentFragments, r || ratio);
        dispatch(insertTreeData({ fragmentList: fragmentList! || currentFragments, nodes: results }))
        dispatch(setCurrentFragments(results.results));
      }
    }}>
      <QueryIcon className="query-icon"></QueryIcon>
      {isEdit ?
        <input
          ref={inputRef}
          placeholder={PLACEHOLDER}
          spellCheck="false"
          onChange={(e) => {
            dispatch(setNLQuery(e.target.value));
          }}
          className="nl-query"
          value={NLQuery}
          onBlur={() => setIsEdit(false)}
        /> :
        <span onClick={() => {
          flushSync(() => setIsEdit(true));
          if (inputRef.current) inputRef.current.focus();
        }} className="nl-query" style={{ color: !coloredText ? "gray" : "#000" }} dangerouslySetInnerHTML={{ __html: coloredText || PLACEHOLDER }}></span>
      }
      <button className="send" type="submit" disabled={!NLQuery || isRequesting}>
        <SubmitIcon></SubmitIcon>
      </button>
    </form>
  );
}
