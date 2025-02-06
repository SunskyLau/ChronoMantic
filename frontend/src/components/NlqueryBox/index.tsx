import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import "./index.css";
import { addQuerySpec, setNLQuery, setQuery } from "../../app/slice/stateSlice";
import QueryIcon from "../../icons/Query";
import SubmitIcon from "../../icons/Submit";
import { flushSync } from "react-dom";
import { AudioFilled } from "@ant-design/icons";
import { classnames } from "../../utils/classname";
import type { SpeechRecognitionType } from "../../types";
import { Empty, Popover } from "antd";
import { getFragmentsBySpec, getQuerySpecRequest } from "../../api";
import { Query, QuerySpec } from "../../types/QuerySpec";
import Target from "./Target";
import { deepClone } from "../../utils/deepclone";
import Scope from "./Scope";
import Trend from "./Trend";
import Relation from "./Relation";
import { setQueryResults } from "../../app/slice/approximation";
import Glyph from "./Glyph";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition;
SpeechRecognition.lang = 'en-US';
SpeechRecognition.continuous = true;

const PLACEHOLDER = "Please enter your query...";

const ColoredTextComponent: React.FC<{ query: Query | null }> = ({ query }) => {
  const values = useAppSelector((state) => state.dataset.dataset?.valueColumns) || [];
  const NLQuery = useAppSelector((state) => state.states.NLQuery);
  const data = useAppSelector((state) => state.dataset.dataset?.data) || {};
  const date = useAppSelector((state) => state.dataset.dataset?.data[state.dataset.dataset.timeStampColumn]);
  const querySpec = useAppSelector((state) => state.states.querySpec);
  const dispatch = useAppDispatch();
  if (!query || !query.length) return <span>{NLQuery || PLACEHOLDER}</span>;
  const value = data[querySpec?.target || ""] as number[] || [];
  const maxValue = Math.floor(Math.max(...value));
  const minValue = Math.ceil(Math.min(...value));
  const time = date?.map(d => new Date(d).getTime()) || [];
  const minDate = Math.min(...time);
  const maxDate = Math.max(...time);
  const coloredText = query.map((part, index) => {
    const text = part.text;
    if (part.condition) {
      const keys = Object.keys(part.condition);
      return (
        <span key={index}>
          <span onClick={(e) => { e.stopPropagation(); }}>
            <Popover content={keys.map((key) => {
              const k = key as keyof QuerySpec;
              switch (k) {
                case "target":
                  return <Target disabled={part.exact} key={k} title={k} value={part.condition?.[k] || ""} options={values} onChange={(val) => {
                    const newQuery = deepClone(query);
                    newQuery[index].condition = { [k]: val };
                    newQuery[index].text = val;
                    dispatch(setQuery(newQuery));
                  }}></Target>;
                case "trends":
                  return <Trend disabled={part.exact} maxValue={maxDate} minValue={minDate} start={querySpec?.trends?.indexOf(part.condition?.[k]?.at(0) || {})} key={k} trends={part.condition?.[k] || []} onChange={(trends) => {
                    const newQuery = deepClone(query);
                    newQuery[index].condition = { ...newQuery[index].condition, [k]: trends };
                    dispatch(setQuery(newQuery));
                  }}></Trend>;
                case "relations":
                  return <Relation disabled={part.exact} key={k} relations={part.condition?.[k] || []} idLength={querySpec?.trends?.length || 0} onChange={(relations) => {
                    const newQuery = deepClone(query);
                    newQuery[index].condition = { ...newQuery[index].condition, [k]: relations };
                    dispatch(setQuery(newQuery));
                  }}></Relation>;
                case "time_span_condition":
                  return <Scope disabled={part.exact} key={k} title={k} min={part.condition?.[k]?.min?.value || null} max={part.condition?.[k]?.max?.value || null} minInclusive={!!part.condition?.[k]?.min?.inclusive} maxInclusive={!!part.condition?.[k]?.max?.inclusive} onChange={(min, max, minInclusive, maxInclusive) => {
                    const newQuery = deepClone(query);
                    const change = { [k]: { min: !min ? null : { value: min, inclusive: minInclusive }, max: !max ? null : { value: max, inclusive: maxInclusive } } };
                    newQuery[index].condition = { ...newQuery[index].condition, ...change };
                    dispatch(setQuery(newQuery));
                  }} ></Scope>;
                case "time_scope_condition":
                  return <Scope disabled={part.exact} key={k} title={k} minValue={minDate} maxValue={maxDate} min={part.condition?.[k]?.min?.value || null} max={part.condition?.[k]?.max?.value || null} minInclusive={!!part.condition?.[k]?.min?.inclusive} maxInclusive={!!part.condition?.[k]?.max?.inclusive} onChange={(min, max, minInclusive, maxInclusive) => {
                    const newQuery = deepClone(query);
                    const change = { [k]: { min: !min ? null : { value: min, inclusive: minInclusive }, max: !max ? null : { value: max, inclusive: maxInclusive } } };
                    newQuery[index].condition = { ...newQuery[index].condition, ...change };
                    dispatch(setQuery(newQuery));
                  }} ></Scope>;
                case "value_scope_condition":
                  return <Scope disabled={part.exact} key={k} title={k} minValue={minValue} maxValue={maxValue} min={part.condition?.[k]?.min?.value || null} max={part.condition?.[k]?.max?.value || null} minInclusive={!!part.condition?.[k]?.min?.inclusive} maxInclusive={!!part.condition?.[k]?.max?.inclusive} onChange={(min, max, minInclusive, maxInclusive) => {
                    const newQuery = deepClone(query);
                    const change = { [k]: { min: !min ? null : { value: min, inclusive: minInclusive }, max: !max ? null : { value: max, inclusive: maxInclusive } } };
                    newQuery[index].condition = { ...newQuery[index].condition, ...change };
                    dispatch(setQuery(newQuery));
                  }} ></Scope>;
                default:
                  return <Empty key={k}></Empty>;
              }
            })} trigger="click">
              <b style={{ backgroundColor: "#0077FF33" }}>{text}</b>
            </Popover>
          </span>
          {keys.includes("trends") || keys.includes("relations") ? <Glyph key={`glyph-${index}`} trends={part.condition.trends} relations={part.condition.relations} allTrends={querySpec?.trends}></Glyph> : null}
        </span>
      );
    }
    return <span key={index}>{text}</span>;
  });
  return <>{coloredText}<Glyph allTrends={querySpec?.trends} relations={querySpec?.relations} trends={querySpec?.trends}></Glyph></>;
};

export default function NlqueryBox() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const query = useAppSelector((state) => state.states.query) || [];
  const querySpec = useAppSelector((state) => state.states.querySpec);
  const dispatch = useAppDispatch();
  const NLQuery = useAppSelector((state) => state.states.NLQuery);
  const isRequesting = useAppSelector((state) => state.results.isRequesting);
  const [isEdit, setIsEdit] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognition = useRef<SpeechRecognitionType>(new SpeechRecognition());

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [NLQuery, isEdit]);

  return (
    <form
      className="nl-query-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!NLQuery.trim() || !querySpec) return;
        getFragmentsBySpec(querySpec).then(res => {
          dispatch(setQueryResults(res));
          dispatch(addQuerySpec(querySpec));
        });
      }}
    >
      <QueryIcon className="query-icon"></QueryIcon>
      {isEdit ? (
        <textarea
          ref={textareaRef}
          placeholder={PLACEHOLDER}
          spellCheck="false"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (textareaRef.current && NLQuery.trim()) {
                textareaRef.current.blur();
                dispatch(setQuery(null));
                getQuerySpecRequest(NLQuery).then(res => {
                  dispatch(setQuery(res));
                });
              }
            }
          }}
          onChange={(e) => {
            dispatch(setNLQuery(e.target.value));
          }}
          className="nl-query"
          value={NLQuery}
          onBlur={() => setIsEdit(false)}
          rows={1}
        />
      ) : (
        <div
          onClick={() => {
            flushSync(() => setIsEdit(true));
            if (textareaRef.current) {
              textareaRef.current.focus();
              textareaRef.current.setSelectionRange(-1, -1);
            }
          }}
          className="nl-query text"
          style={{ color: !NLQuery ? "gray" : "#000" }}
        ><ColoredTextComponent query={query}></ColoredTextComponent></div>
      )}
      <button onClick={() => {
        if (!SpeechRecognition) {
          console.error("SpeechRecognition is not supported!");
          return;
        }
        if (!isRecording) {
          recognition.current.onresult = ({ results }: { results: SpeechRecognitionResultList }) => {
            const transcript = results[0][0].transcript;
            console.log('receive audio:', transcript);
            const sentence = transcript.replace(/[^\w\s]/gi, '');
            dispatch(setNLQuery(`${NLQuery} ${sentence}`));
          };
          recognition.current.onend = () => recognition.current.start();
          recognition.current.start();
        } else {
          recognition.current.onend = null;
          recognition.current.onresult = null;
          recognition.current.stop();
        }
        setIsRecording((prevIsRecording) => !prevIsRecording);
      }} className={classnames("btn audio", isRecording ? "active" : "")} type="button" disabled={isRequesting}>
        <AudioFilled />
      </button>
      <button className="btn send" type="submit" disabled={!NLQuery || isRequesting}>
        <SubmitIcon></SubmitIcon>
      </button>
    </form>
  );
}