import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import "./index.css";
import { addQuerySpec, setNLQuery, setQuery, setQuerySpec } from "../../app/slice/stateSlice";
import QueryIcon from "../../icons/Query";
import SubmitIcon from "../../icons/Submit";
import { flushSync } from "react-dom";
import { AudioFilled, LoadingOutlined } from "@ant-design/icons";
import { classnames } from "../../utils/classname";
import type { SpeechRecognitionType } from "../../types";
import { getFragmentsBySpec, getQuerySpecRequest } from "../../api";
import { setQueryResults } from "../../app/slice/approximation";
import { setIsRequesting } from "../../app/slice/resultsSlice";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition;
SpeechRecognition.lang = 'en-US';
SpeechRecognition.continuous = true;

const PLACEHOLDER = "Please enter your query...";

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
  // const [promptList, setPromptList] = useState<string[]>([]);
  // const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  // const [editPos, setEditPos] = useState<{ x: number, y: number, width: number }>({ x: 0, y: 0, width: 0 });
  // const modifyPrompt = useAppSelector((state) => state.states.modifyPrompts);

  // function adjustPos() {
  //   const dom = textareaRef.current || textRef.current;
  //   if (!dom) return;
  //   const rect = dom.getBoundingClientRect();
  //   setEditPos({ x: rect.left, y: rect.top + rect.height, width: rect.width });
  // }

  // const fetchPrompt = useCallback(debounce((query: string) => {
  //   setPromptList([]);
  //   getSearchPrompt(query).then(res => {
  //     setIsDropdownVisible(true);
  //     setPromptList(res);
  //     adjustPos();
  //   })
  // }, 1000), [])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      window.dispatchEvent(new Event("resize"));
    }
  }, [NLQuery, isEdit]);

  // useEffect(() => {
  //   abortRequest();
  //   setIsDropdownVisible(false);
  //   setPromptList([]);
  //   adjustPos();
  // }, [NLQuery]);

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
            // fetchPrompt(e.target.value)
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
          style={{ color: !NLQuery ? "gray" : "#000", cursor: isRequesting ? "not-allowed" : "text" }}
        >{NLQuery || PLACEHOLDER}{isRequesting && <LoadingOutlined style={{ marginLeft: 8 }} />}</div>
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
      {/* <Dropdown overlayStyle={{ position: 'absolute', top: `${editPos.y}px`, left: `${editPos.x}px`, width: `${editPos.width}px` }} open={isEdit && isDropdownVisible} menu={{
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
      <Dropdown overlayStyle={{ position: 'absolute', top: `${editPos.y}px`, left: `${editPos.x}px`, width: `${editPos.width}px` }} open={!!modifyPrompt.length} menu={{
        items: modifyPrompt.map((prompt) => ({ key: prompt, label: prompt })), onClick: (info) => {
          const value = info.key;
          dispatch(setNLQuery(value));
          dispatch(setModifyPrompts([]));
        }
      }}>
        <span style={{ visibility: 'hidden' }}> </span>
      </Dropdown> */}
    </form>
  );
}