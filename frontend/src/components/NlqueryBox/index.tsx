import { useEffect, useRef, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import "./index.css";
import { setColorMap, setNLQuery, setOriginalQuery, setQuery, setQuerySpec } from "../../app/slice/stateSlice";
import QueryIcon from "../../icons/Query";
import SubmitIcon from "../../icons/Submit";
import { LoadingOutlined } from "@ant-design/icons";
import { classnames } from "../../utils/classname";
import type { SpeechRecognitionType } from "../../types";
import { addChatHistory, getFragmentsBySpec, getQuerySpecRequest } from "../../api";
import { setQueryResults } from "../../app/slice/approximation";
import { setIsRequesting } from "../../app/slice/resultsSlice";
import { formatQuerySpec, QuerySpecWithSource } from "../../types/QuerySpec";
import { deepClone } from "../../utils/deepclone";
import HighlightedText from './HighlightedText';
import AudioIcon from "../../icons/Audio";

// 语音识别配置
const initSpeechRecognition = () => {
	const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition;
	SpeechRecognition.lang = "en-US";
	SpeechRecognition.continuous = true;
	return SpeechRecognition;
};

const SpeechRecognition = initSpeechRecognition();

// 文本源切换工具
const TextSourceToggler = {
	toggleSource: (query: QuerySpecWithSource, text_source_id: number) => {
		if (!query.text_sources[text_source_id]) return;
		query.text_sources[text_source_id].disabled = !query.text_sources[text_source_id].disabled;
	}
};

const PLACEHOLDER = "Please enter your query...";

export default function NlqueryBox() {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const textRef = useRef<HTMLDivElement>(null);
	const query = useAppSelector((state) => state.states.query);
	const dispatch = useAppDispatch();
	const NLQuery = useAppSelector((state) => state.states.NLQuery);
	const isRequesting = useAppSelector((state) => state.results.isRequesting);
	const [isEdit, setIsEdit] = useState(false);
	const [isRecording, setIsRecording] = useState(false);
	const recognition = useRef<SpeechRecognitionType>(new SpeechRecognition());
	const colorMap = useAppSelector((state) => state.states.colorMap);

	const handleTextareaResize = useCallback(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
		}
	}, []);

	useEffect(() => {
		handleTextareaResize();
	}, [NLQuery, isEdit, handleTextareaResize]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (textareaRef.current && 
				!textareaRef.current.contains(event.target as Node) && 
				!document.querySelector(".ant-dropdown")?.contains(event.target as Node)) {
				setIsEdit(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside, { capture: true });
		return () => document.removeEventListener("mousedown", handleClickOutside, { capture: true });
	}, []);

	const toggleTextSourceDisabled = useCallback((text_source_id: number) => {
		if (!query) return;
		const newQuery = deepClone(query);
		TextSourceToggler.toggleSource(newQuery, text_source_id);
		dispatch(setQuery(newQuery));
	}, [query, dispatch]);

	const handleSubmit = useCallback(async (e: React.FormEvent) => {
		e.preventDefault();
		if (!NLQuery.trim() || !query) return;
		const querySpec = formatQuerySpec(query);
		dispatch(setQuerySpec(querySpec));
		dispatch(setOriginalQuery(query));
		addChatHistory(NLQuery, JSON.stringify(query));
		const res = await getFragmentsBySpec(querySpec);
		dispatch(setQueryResults(res));
	}, [NLQuery, query, dispatch]);

	const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			dispatch(setIsRequesting(true));
			if (textareaRef.current && NLQuery.trim()) {
				textareaRef.current.blur();
				setIsEdit(false);
				dispatch(setQuery(null));
				dispatch(setColorMap(null));
				getQuerySpecRequest(NLQuery)
					.then((res) => {
						dispatch(setQuery(res));
						dispatch(setColorMap(res));
					})
					.finally(() => {
						dispatch(setIsRequesting(false));
					});
			}
		}
	}, [NLQuery, dispatch]);

	return (
		<form
			className="nl-query-form"
			onSubmit={handleSubmit}
		>
			<QueryIcon className="query-icon"></QueryIcon>
			{isEdit ? (
				<textarea
					ref={textareaRef}
					placeholder={PLACEHOLDER}
					spellCheck="false"
					onKeyDown={handleKeyDown}
					onChange={(e) => dispatch(setNLQuery(e.target.value))}
					className="nl-query"
					value={NLQuery}
					rows={1}
				/>
			) : (
				<div
					onClick={() => {
						if (isRequesting) return;
						setIsEdit(true);
						requestAnimationFrame(() => {
							if (textareaRef.current) {
								textareaRef.current.focus();
								textareaRef.current.setSelectionRange(-1, -1);
							}
						});
					}}
					ref={textRef}
					className="nl-query text"
					style={{
						color: !NLQuery ? "gray" : "#000",
						cursor: isRequesting ? "not-allowed" : "text",
					}}
				>
					{NLQuery ? (
						<HighlightedText
							text={NLQuery}
							colorMap={colorMap}
							query={query}
							onToggleDisabled={toggleTextSourceDisabled}
						/>
					) : PLACEHOLDER}
					{isRequesting && <LoadingOutlined style={{ marginLeft: 8 }} />}
				</div>
			)}
			<button
				onClick={() => {
					if (!SpeechRecognition) {
						console.error("SpeechRecognition is not supported!");
						return;
					}
					if (!isRecording) {
						recognition.current.onresult = ({ results }: { results: SpeechRecognitionResultList }) => {
							const transcript = results[0][0].transcript;
							console.log("receive audio:", transcript);
							const sentence = transcript.replace(/[^\w\s]/gi, "");
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
				}}
				className={classnames("btn audio", isRecording ? "active" : "")}
				type="button"
				disabled={isRequesting}
			>
				<AudioIcon></AudioIcon>
			</button>
			<button
				className="btn send"
				type="submit"
				disabled={!NLQuery || isRequesting}
			>
				<SubmitIcon></SubmitIcon>
			</button>
		</form>
	);
}
