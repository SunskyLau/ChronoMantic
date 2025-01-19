import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import "./index.css";
import { setNLQuery } from "../../app/slice/stateSlice";
import { getColor } from "../../utils/color";
import QueryIcon from "../../icons/Query";
import SubmitIcon from "../../icons/Submit";
import { flushSync } from "react-dom";
import { AudioFilled } from "@ant-design/icons";
import { classnames } from "../../utils/classname";
import type { SpeechRecognitionType } from "../../types";
import { Input, Popover } from "antd";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition;
SpeechRecognition.lang = 'en-US';
SpeechRecognition.continuous = true;

const PLACEHOLDER = "Please enter your query...";

const ColoredTextComponent: React.FC<{ query: string, keys: string[] }> = ({ query, keys }) => {
  const coloredText = (query || PLACEHOLDER).split(/(\s+)/).map((part, index) => {
    if (keys.includes(part.toLowerCase())) {
      return (
        <span key={index} onClick={(e) => { e.stopPropagation(); }}>
          <Popover content={<Input></Input>} trigger="click">
            <b style={{ backgroundColor: getColor(index) }}>{part}</b>
          </Popover>
        </span>
      );
    }
    return <span>{part}</span>;
  });
  return <span>{coloredText}</span>;
};

export default function NlqueryBox() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dispatch = useAppDispatch();
  const NLQuery = useAppSelector((state) => state.states.NLQuery);
  const isRequesting = useAppSelector((state) => state.results.isRequesting);
  const trend = useAppSelector((state) => state.results.trend);
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
      }}
    >
      <QueryIcon className="query-icon"></QueryIcon>
      {isEdit ? (
        <textarea
          ref={textareaRef}
          placeholder={PLACEHOLDER}
          spellCheck="false"
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
        ><ColoredTextComponent query={NLQuery} keys={trend}></ColoredTextComponent></div>
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