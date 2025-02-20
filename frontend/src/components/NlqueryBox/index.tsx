import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import "./index.css";
import { setColorMap, setNLQuery, setOriginalQuery, setQuery, setQuerySpec } from "../../app/slice/stateSlice";
import QueryIcon from "../../icons/Query";
import SubmitIcon from "../../icons/Submit";
import { flushSync } from "react-dom";
import { AudioFilled, LoadingOutlined } from "@ant-design/icons";
import { classnames } from "../../utils/classname";
import type { SpeechRecognitionType } from "../../types";
import { getFragmentsBySpec, getQuerySpecRequest } from "../../api";
import { setQueryResults } from "../../app/slice/approximation";
import { setIsRequesting } from "../../app/slice/resultsSlice";
import { getColorFromMap } from "../../utils/color";
import { formatQuerySpec, QuerySpecWithSource } from "../../types/QuerySpec";
import { deepClone } from "../../utils/deepclone";

// 语音识别配置
const initSpeechRecognition = () => {
	const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition;
	SpeechRecognition.lang = "en-US";
	SpeechRecognition.continuous = true;
	return SpeechRecognition;
};

const SpeechRecognition = initSpeechRecognition();

// 文本源检查工具
const TextSourceChecker = {
	isTextDisabled: (query: QuerySpecWithSource, text_source_id: number): boolean => {
		return query.text_sources[text_source_id]?.disabled || false;
	}
};

// 文本源切换工具
const TextSourceToggler = {
	toggleSource: (query: QuerySpecWithSource, text_source_id: number) => {
		if (!query.text_sources[text_source_id]) return;
		query.text_sources[text_source_id].disabled = !query.text_sources[text_source_id].disabled;
	}
};

// 定义高亮类型
interface Highlight {
	index: number;
	length: number;
	text: string;
	color: string;
	text_source_id: number;
	disabled: boolean;
}

// 高亮文本处理工具
const TextHighlighter = {
	createHighlight: (match: RegExpExecArray, text_source_id: number, query: QuerySpecWithSource | null, colorMap: Record<string, string>): Highlight | null => {
		const textSource = query?.text_sources[text_source_id];
		if (!textSource) return null;

		const isDisabled = query ? TextSourceChecker.isTextDisabled(query, text_source_id) : false;
		
		return {
			index: match.index,
			length: textSource.text.length,
			text: textSource.text,
			color: isDisabled ? "#eee" : getColorFromMap(colorMap, text_source_id),
			text_source_id,
			disabled: isDisabled,
		};
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

	const handleTextareaResize = () => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
			window.dispatchEvent(new Event("resize"));
		}
	};

	useEffect(() => {
		handleTextareaResize();
	}, [NLQuery, isEdit]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (textareaRef.current && 
				!textareaRef.current.contains(event.target as Node) && 
				!document.querySelector(".ant-dropdown")?.contains(event.target as Node)) {
				setIsEdit(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const toggleTextSourceDisabled = (text_source_id: number) => {
		if (!query) return;
		const newQuery = deepClone(query);
		TextSourceToggler.toggleSource(newQuery, text_source_id);
		dispatch(setQuery(newQuery));
	};

	const highlightText = (text: string) => {
		if (!text || !colorMap || !query) return text;
		const highlights: Array<Highlight | null> = [];

		Object.entries(query.text_sources).forEach(([text_source_id, textSource]) => {
			if (!colorMap[text_source_id]) return;

			const regex = new RegExp(textSource.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
			let match;
			let count = 0;

			while ((match = regex.exec(text)) !== null) {
				if (count === textSource.index) {
					const highlight = TextHighlighter.createHighlight(
						match, 
						parseInt(text_source_id), 
						query, 
						colorMap
					);
					highlights.push(highlight);
					break;
				}
				count++;
			}
		});

		return renderHighlights(text, highlights);
	};

	const renderHighlights = (text: string, highlights: Array<Highlight | null>) => {
		const validHighlights = highlights.filter((h): h is Highlight => h !== null);
		
		validHighlights.sort((a, b) => a.index - b.index);
		const elements: React.ReactNode[] = [];
		let lastIndex = 0;

		validHighlights.forEach(highlight => {
			if (highlight.index > lastIndex) {
				elements.push(text.substring(lastIndex, highlight.index));
			}
			elements.push(
				<span
					key={`${highlight.text_source_id}`}
					style={{
						backgroundColor: highlight.color,
						textDecoration: highlight.disabled ? "line-through" : "none",
						opacity: highlight.disabled ? 0.5 : 1,
					}}
					className="pointer"
					onClick={(e) => {
						e.stopPropagation();
						toggleTextSourceDisabled(highlight.text_source_id);
					}}
				>
					{highlight.text}
				</span>
			);
			lastIndex = highlight.index + highlight.length;
		});

		if (lastIndex < text.length) {
			elements.push(text.substring(lastIndex));
		}

		return <>{elements}</>;
	};

	return (
		<form
			className="nl-query-form"
			onSubmit={async (e) => {
				e.preventDefault();
				if (!NLQuery.trim() || !query) return;
				const querySpec = formatQuerySpec(query);
				dispatch(setQuerySpec(querySpec));
				dispatch(setOriginalQuery(query));
				getFragmentsBySpec(querySpec).then((res) => {
					dispatch(setQueryResults(res));
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
					}}
					onChange={(e) => {
						dispatch(setNLQuery(e.target.value));
					}}
					className="nl-query"
					value={NLQuery}
					rows={1}
				/>
			) : (
				<div
					onClick={() => {
						if (isRequesting) return;
						flushSync(() => {
							setIsEdit(true);
						});
						if (textareaRef.current) {
							textareaRef.current.focus();
							textareaRef.current.setSelectionRange(-1, -1);
						}
					}}
					ref={textRef}
					className="nl-query text"
					style={{
						color: !NLQuery ? "gray" : "#000",
						cursor: isRequesting ? "not-allowed" : "text",
					}}
				>
					{NLQuery ? highlightText(NLQuery) : PLACEHOLDER}
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
				<AudioFilled />
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
