import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import "./index.css";
import { setColorMap, setNLQuery, setQuery } from "../../app/slice/stateSlice";
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
import { formatQuerySpec, QuerySpecWithSource, ScopeConditionWithSource, TextSource } from "../../types/QuerySpec";
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
	checkSource: (source: { text_source?: TextSource } | undefined, matchText: string, targetIndex: number) => {
		return source?.text_source?.text === matchText && 
			   source.text_source.index === targetIndex && 
			   source.text_source.disabled;
	},

	checkScope: (scope: ScopeConditionWithSource | undefined, matchText: string, targetIndex: number) => {
		if (!scope) return false;
		return TextSourceChecker.checkSource(scope.max, matchText, targetIndex) || 
			   TextSourceChecker.checkSource(scope.min, matchText, targetIndex);
	},

	isTextDisabled: (query: QuerySpecWithSource, matchText: string, targetIndex: number): boolean => {
		if (TextSourceChecker.checkSource(query.target, matchText, targetIndex)) return true;

		// 检查趋势
		for (const trend of query.trends) {
			if (TextSourceChecker.checkSource(trend.category, matchText, targetIndex)) return true;
			if (TextSourceChecker.checkScope(trend.slope_scope_condition, matchText, targetIndex)) return true;
			if (TextSourceChecker.checkScope(trend.delta_percentage_scope_condition, matchText, targetIndex)) return true;
			if (TextSourceChecker.checkScope(trend.daily_average_delta_percentage_scope_condition, matchText, targetIndex)) return true;
			if (TextSourceChecker.checkScope(trend.abs_slope_percentage_scope_condition, matchText, targetIndex)) return true;
			if (TextSourceChecker.checkScope(trend.time_span_condition, matchText, targetIndex)) return true;
		}

		// 检查关系
		if (query.relations?.some(relation => TextSourceChecker.checkSource(relation, matchText, targetIndex))) return true;

		// 检查时间跨度组合条件
		if (query.trend_time_span_composition_conditions) {
			if (Array.isArray(query.trend_time_span_composition_conditions)) {
				for (const condition of query.trend_time_span_composition_conditions) {
					if (TextSourceChecker.checkSource(condition, matchText, targetIndex)) return true;
					if (TextSourceChecker.checkScope(condition.time_span_condition, matchText, targetIndex)) return true;
				}
			} else {
				if (TextSourceChecker.checkScope(query.trend_time_span_composition_conditions, matchText, targetIndex)) return true;
			}
		}

		// 检查其他范围条件
		return TextSourceChecker.checkScope(query.time_scope_condition, matchText, targetIndex) ||
			   TextSourceChecker.checkScope(query.max_value_scope_condition, matchText, targetIndex) ||
			   TextSourceChecker.checkScope(query.min_value_scope_condition, matchText, targetIndex) || false;
	}
};

// 文本源切换工具
const TextSourceToggler = {
	toggleSource: (source: { text_source?: TextSource } | undefined, text: string, index: number): boolean => {
		if (source?.text_source?.text === text && source.text_source.index === index) {
			source.text_source.disabled = !source.text_source.disabled;
			return true;
		}
		return false;
	},

	toggleScope: (scope: ScopeConditionWithSource | undefined, text: string, index: number) => {
		if (!scope) return;
		TextSourceToggler.toggleSource(scope.max, text, index);
		TextSourceToggler.toggleSource(scope.min, text, index);
	},

	toggleQuerySources: (query: QuerySpecWithSource, text: string, index: number) => {
		TextSourceToggler.toggleSource(query.target, text, index);

		// 切换趋势相关
		query.trends.forEach(trend => {
			TextSourceToggler.toggleSource(trend.category, text, index);
			TextSourceToggler.toggleScope(trend.slope_scope_condition, text, index);
			TextSourceToggler.toggleScope(trend.delta_percentage_scope_condition, text, index);
			TextSourceToggler.toggleScope(trend.daily_average_delta_percentage_scope_condition, text, index);
			TextSourceToggler.toggleScope(trend.abs_slope_percentage_scope_condition, text, index);
			TextSourceToggler.toggleScope(trend.time_span_condition, text, index);
		});

		// 切换关系
		query.relations?.forEach(relation => {
			TextSourceToggler.toggleSource(relation, text, index);
		});

		// 切换时间跨度组合条件
		if (query.trend_time_span_composition_conditions) {
			if (Array.isArray(query.trend_time_span_composition_conditions)) {
				query.trend_time_span_composition_conditions.forEach(condition => {
					TextSourceToggler.toggleSource(condition, text, index);
					TextSourceToggler.toggleScope(condition.time_span_condition, text, index);
				});
			} else {
				TextSourceToggler.toggleScope(query.trend_time_span_composition_conditions, text, index);
			}
		}

		// 切换其他范围条件
		TextSourceToggler.toggleScope(query.time_scope_condition, text, index);
		TextSourceToggler.toggleScope(query.max_value_scope_condition, text, index);
		TextSourceToggler.toggleScope(query.min_value_scope_condition, text, index);
	}
};

// 高亮文本处理工具
const TextHighlighter = {
	parseKey: (key: string) => {
		const lastHyphenIndex = key.lastIndexOf("-");
		if (lastHyphenIndex === -1 || !/^\d+$/.test(key.slice(lastHyphenIndex + 1))) {
			return { matchText: key, targetIndex: 0 };
		}
		return {
			matchText: key.slice(0, lastHyphenIndex),
			targetIndex: parseInt(key.slice(lastHyphenIndex + 1))
		};
	},

	createHighlight: (match: RegExpExecArray, matchText: string, targetIndex: number, query: QuerySpecWithSource | null, colorMap: Record<string, string>) => {
		const isDisabled = query ? TextSourceChecker.isTextDisabled(query, matchText, targetIndex) : false;
		return {
			index: match.index,
			length: matchText.length,
			text: matchText,
			color: isDisabled ? "#eee" : getColorFromMap(colorMap, { text: matchText, index: targetIndex }),
			matchIndex: targetIndex,
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

	const toggleTextSourceDisabled = (text: string, index: number) => {
		if (!query) return;
		const newQuery = deepClone(query);
		TextSourceToggler.toggleQuerySources(newQuery, text, index);
		dispatch(setQuery(newQuery));
	};

	const highlightText = (text: string) => {
		if (!text || !colorMap) return text;
		const highlights: Array<ReturnType<typeof TextHighlighter.createHighlight>> = [];

		Object.keys(colorMap).forEach(key => {
			const { matchText, targetIndex } = TextHighlighter.parseKey(key);
			const regex = new RegExp(matchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
			let match;
			let count = 0;

			while ((match = regex.exec(text)) !== null) {
				if (count === targetIndex) {
					highlights.push(TextHighlighter.createHighlight(match, matchText, targetIndex, query, colorMap));
					break;
				}
				count++;
			}
		});

		return renderHighlights(text, highlights);
	};

	const renderHighlights = (text: string, highlights: Array<ReturnType<typeof TextHighlighter.createHighlight>>) => {
		highlights.sort((a, b) => a.index - b.index);
		const elements: React.ReactNode[] = [];
		let lastIndex = 0;

		highlights.forEach(highlight => {
			if (highlight.index > lastIndex) {
				elements.push(text.substring(lastIndex, highlight.index));
			}
			elements.push(
				<span
					key={`${highlight.text}-${highlight.index}`}
					style={{
						backgroundColor: highlight.color,
						textDecoration: highlight.disabled ? "line-through" : "none",
						opacity: highlight.disabled ? 0.5 : 1,
					}}
					className="pointer"
					onClick={(e) => {
						e.stopPropagation();
						toggleTextSourceDisabled(highlight.text, highlight.matchIndex);
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
				getFragmentsBySpec(formatQuerySpec(query)).then((res) => {
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
