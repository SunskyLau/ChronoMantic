import { useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import "./index.css";
import { setFragments, setNLQuery, setQuerySpec, setRatio } from "../../app/slice/stateSlice";
import { getFragmentsByTimeGranularity, getQueryResult, getQuerySpecRequest, getScaleRatio } from "../../api";
// import { setIsRequesting } from "../../app/slice/resultsSlice";
import { getColor } from "../../utils/color";
import { flushSync } from "react-dom";
import QueryIcon from "../../icons/Query";
import SubmitIcon from "../../icons/Submit";
import { setResults } from "../../app/slice/resultsSlice";

export default function NlqueryBox() {
  const inputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const NLQuery = useAppSelector((state) => state.states.NLQuery);
  const datasetName = useAppSelector((state) => state.dataset.dataset?.datasetName);
  const timeStampColumnName = useAppSelector((state) => state.dataset.dataset?.timeStampColumnName);
  const isRequesting = useAppSelector((state) => state.results.isRequesting);
  const trend = useAppSelector((state) => state.results.trend);
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
      if (!datasetName || !NLQuery) return;
      // dispatch(setIsRequesting(true));
      const querySpec = await getQuerySpecRequest(NLQuery);
      if (querySpec.valueColumnName) {
        dispatch(setQuerySpec(querySpec));
        if (querySpec.timeGranularity && timeStampColumnName) {
          const fragments = await getFragmentsByTimeGranularity(datasetName, timeStampColumnName, querySpec.valueColumnName, querySpec.timeGranularity);
          dispatch(setFragments(fragments));
          const ratio = await getScaleRatio(datasetName, timeStampColumnName, querySpec.valueColumnName)
          dispatch(setRatio(ratio));
          const results = await getQueryResult(querySpec, fragments, ratio)
          dispatch(setResults(results));
        }
      }
      // dispatch(setIsRequesting(false));
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
        }} className="nl-query" dangerouslySetInnerHTML={{ __html: coloredText || PLACEHOLDER }}></span>
      }
      <button className="send" type="submit" disabled={!NLQuery || isRequesting}>
        <SubmitIcon></SubmitIcon>
      </button>
    </form>
  );
}
