import { classnames } from "../../utils/classname";
import "./index.css";

interface PanelProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

export default function Block({ children, title, className }: PanelProps) {
    return (
        <div className={classnames("block", className)}>
            <h2 className="block-title">{title}</h2>
            <div className="block-content">{children}</div>
        </div>
    );
}