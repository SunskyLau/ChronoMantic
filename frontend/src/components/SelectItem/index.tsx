import { useEffect, useRef, useState } from "react";
import "./index.css";
import { Select } from "antd";

interface SelectProps {
    choices: string[];
    value: string;
    title: string;
    handleSelect: (value: string) => void;
}

export default function SelectItem({ choices, value, title, handleSelect }: SelectProps) {
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
                <Select popupMatchSelectWidth={false} allowClear value={value} onChange={handleSelect} options={choices.map(choice => ({ value: choice }))}></Select>
            </div>
        </div>
    )
}