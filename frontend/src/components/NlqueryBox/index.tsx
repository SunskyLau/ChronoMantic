import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import "./index.css";
import { addQuerySpec, setNLQuery, setQuery, setQuerySpec } from "../../app/slice/stateSlice";
import QueryIcon from "../../icons/Query";
import SubmitIcon from "../../icons/Submit";
import { flushSync } from "react-dom";
import { AudioFilled, LoadingOutlined } from "@ant-design/icons";
import { classnames } from "../../utils/classname";
import type { SpeechRecognitionType } from "../../types";
import { Divider, Dropdown, Popover } from "antd";
import { getFragmentsBySpec, getQuerySpecRequest, getSearchPrompt } from "../../api";
import Target from "./Target";
import { deepClone } from "../../utils/deepclone";
import Scope from "./Scope";
import Trend from "./Trend";
import Relation from "./Relation";
import { setQueryResults } from "../../app/slice/approximation";
import Glyph from "./Glyph";
import { setIsRequesting } from "../../app/slice/resultsSlice";
import { debounce } from "../../utils/debounce";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition;
SpeechRecognition.lang = 'en-US';
SpeechRecognition.continuous = true;

const PLACEHOLDER = "Please enter your query...";

const ColoredTextComponent = () => {
  const values = useAppSelector((state) => state.dataset.dataset?.valueColumns) || [];
  const NLQuery = useAppSelector((state) => state.states.NLQuery);
  const data = useAppSelector((state) => state.dataset.dataset?.data) || {};
  const date = useAppSelector((state) => state.dataset.dataset?.data[state.dataset.dataset.timeStampColumn]);
  const querySpec = useAppSelector((state) => state.states.querySpec);
  const dispatch = useAppDispatch();
  if (!querySpec) return <span>{NLQuery || PLACEHOLDER}</span>;
  const value = data[querySpec?.target || ""] as number[] || [];
  const maxValue = Math.floor(Math.max(...value));
  const minValue = Math.ceil(Math.min(...value));
  const time = date?.map(d => new Date(d).getTime()) || [];
  const minDate = Math.min(...time);
  const maxDate = Math.max(...time);
  return <>
    {NLQuery}
    <span onClick={(e) => e.stopPropagation()}>
      <Popover content={
        <>
          <Target title="Target" value={querySpec?.target || ""} options={values} onChange={(val) => {
            const newQuerySpec = deepClone(querySpec);
            newQuerySpec.target = val;
            dispatch(setQuerySpec(newQuerySpec));
          }}></Target>
          <Divider></Divider>
          {querySpec.trends?.length && <Trend maxValue={maxDate} minValue={minDate} trends={querySpec.trends || []} onChange={(trends) => {
            const newQuerySpec = deepClone(querySpec);
            newQuerySpec.trends = trends;
            dispatch(setQuerySpec(newQuerySpec));
          }}></Trend>}
          {querySpec.relations?.length && <Relation relations={querySpec.relations || []} idLength={querySpec?.trends?.length || 0} onChange={(relations) => {
            const newQuerySpec = deepClone(querySpec);
            newQuerySpec.relations = relations;
            dispatch(setQuerySpec(newQuerySpec));
          }}></Relation>}
          {querySpec.time_span_condition && <><Scope title={"Time Span Condition"} min={querySpec.time_span_condition?.min?.value || null} max={querySpec.time_span_condition?.max?.value || null} minInclusive={!!querySpec.time_span_condition?.min?.inclusive} maxInclusive={!!querySpec.time_span_condition?.max?.inclusive} onChange={(min, max, minInclusive, maxInclusive) => {
            const newQuerySpec = deepClone(querySpec);
            newQuerySpec.time_span_condition = { min: !min && min !== 0 ? null : { value: min, inclusive: minInclusive }, max: !max && max !== 0 ? null : { value: max, inclusive: maxInclusive } };
            dispatch(setQuerySpec(newQuerySpec));
          }} ></Scope><Divider></Divider></>}
          {querySpec.time_scope_condition && <><Scope title={"Time Scope Condition"} minValue={minDate} maxValue={maxDate} min={querySpec.time_scope_condition?.min?.value || null} max={querySpec.time_scope_condition?.max?.value || null} minInclusive={!!querySpec.time_scope_condition?.min?.inclusive} maxInclusive={!!querySpec.time_scope_condition?.max?.inclusive} onChange={(min, max, minInclusive, maxInclusive) => {
            const newQuerySpec = deepClone(querySpec);
            newQuerySpec.time_scope_condition = { min: !min && min !== 0 ? null : { value: min, inclusive: minInclusive }, max: !max && max !== 0 ? null : { value: max, inclusive: maxInclusive } };
            dispatch(setQuerySpec(newQuerySpec));
          }} ></Scope><Divider></Divider></>}
          {querySpec.value_scope_condition && <Scope title={"Value Scope Condition"} minValue={minValue} maxValue={maxValue} min={querySpec.value_scope_condition?.min?.value || null} max={querySpec.value_scope_condition?.max?.value || null} minInclusive={!!querySpec.value_scope_condition?.min?.inclusive} maxInclusive={!!querySpec.value_scope_condition?.max?.inclusive} onChange={(min, max, minInclusive, maxInclusive) => {
            const newQuerySpec = deepClone(querySpec);
            newQuerySpec.value_scope_condition = { min: !min && min !== 0 ? null : { value: min, inclusive: minInclusive }, max: !max && max !== 0 ? null : { value: max, inclusive: maxInclusive } };
            dispatch(setQuerySpec(newQuerySpec));
          }} ></Scope>}
        </>
      } trigger="click">
        <span style={{ cursor: "pointer" }}><Glyph allTrends={querySpec?.trends} relations={querySpec?.relations} trends={querySpec?.trends}></Glyph></span>
      </Popover>
    </span>
  </>;
};

export default function NlqueryBox() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const querySpec = useAppSelector((state) => state.states.querySpec);
  const dispatch = useAppDispatch();
  const NLQuery = useAppSelector((state) => state.states.NLQuery);
  const isRequesting = useAppSelector((state) => state.results.isRequesting);
  const [isEdit, setIsEdit] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognition = useRef<SpeechRecognitionType>(new SpeechRecognition());
  const [promptList, setPromptList] = useState<string[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [editPos, setEditPos] = useState<{ x: number, y: number, width: number }>({ x: 0, y: 0, width: 0 });

  const fetchPrompt = useCallback(debounce((query: string) => {
    setPromptList([]);
    getSearchPrompt(query).then(res => {
      setIsDropdownVisible(true);
      setPromptList(res);
      const dom = textareaRef.current || textRef.current;
      if (!dom) return;
      const rect = dom.getBoundingClientRect();
      setEditPos({ x: rect.left, y: rect.top + rect.height, width: rect.width });
    })
  }, 1000), [])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      window.dispatchEvent(new Event("resize"));
    }
  }, [NLQuery, isEdit]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node) &&
        !document.querySelector(".ant-dropdown")?.contains(event.target as Node)
      ) {
        setIsEdit(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
              dispatch(setIsRequesting(true))
              if (textareaRef.current && NLQuery.trim()) {
                textareaRef.current.blur();
                setIsEdit(false);
                dispatch(setQuery(null));
                getQuerySpecRequest(NLQuery).then(res => {
                  dispatch(setQuerySpec(res));
                }).finally(() => {
                  dispatch(setIsRequesting(false))
                });
              }
            }
          }}
          onChange={(e) => {
            dispatch(setNLQuery(e.target.value));
            fetchPrompt(e.target.value)
          }}
          className="nl-query"
          value={NLQuery}
          rows={1}
        />
      ) : (
        <div
          onClick={() => {
            if (isRequesting) return;
            flushSync(() => { setIsEdit(true); });
            if (textareaRef.current) {
              textareaRef.current.focus();
              textareaRef.current.setSelectionRange(-1, -1);
            }
          }}
          ref={textRef}
          className="nl-query text"
          style={{ color: !NLQuery ? "gray" : "#000", cursor: isRequesting ? "not-allowed" : "pointer" }}
        ><ColoredTextComponent></ColoredTextComponent>{isRequesting && <LoadingOutlined style={{ marginLeft: 8 }} />}</div>
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
      <Dropdown overlayStyle={{ position: 'absolute', top: `${editPos.y}px`, left: `${editPos.x}px`, width: `${editPos.width}px` }} open={isEdit && isDropdownVisible} menu={{
        items: promptList.map((prompt) => ({ key: prompt, label: prompt })), onClick: (info) => {
          const value = NLQuery + (NLQuery[NLQuery.length - 1] === ' ' ? '' : ' ') + info.key;
          dispatch(setNLQuery(value));
          setIsDropdownVisible(false);
          setPromptList([]);
          flushSync(() => setIsEdit(true));
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(-1, -1);
          }
          fetchPrompt(value);
        }
      }}>
        <span style={{ visibility: 'hidden' }}> </span>
      </Dropdown>
    </form>
  );
}