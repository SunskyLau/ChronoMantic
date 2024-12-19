import { useEffect, useRef, useState } from "react";
import ArrowIcon from "../../icons/Arrow";
import "./index.css";

interface SelectProps {
    choices: string[];
    value: string;
    title: string;
    handleSelect: (value: string) => void;
}

export default function Select({ choices, value, title, handleSelect }: SelectProps) {
    const [isShowChoices, setIsShowChoices] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const hideChoices = (e: MouseEvent) => {
            if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
                setIsShowChoices(false);
            }
        }
        document.addEventListener("click", hideChoices)
        return () => {
            document.removeEventListener("click", hideChoices)
        }
    }, [])
    return (
        <div className="choose-item">
            <span className="choose-item-title">{title}</span>
            <div className="choose-item-content" ref={contentRef} onClick={() => { setIsShowChoices(!isShowChoices); }}>
                <span className="choose-item-content-value">{value}</span>
                <ArrowIcon></ArrowIcon>
                {isShowChoices && (<ul className="choose-item-content-list show">
                    {choices.map((choice) => <li key={choice} onClick={(e) => { e.stopPropagation(); handleSelect(choice); setIsShowChoices(false); }}>{choice}</li>)}
                </ul>)}
            </div>
        </div>
    )
}