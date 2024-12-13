import "./index.css";

export interface PanelHeaderProps {
    icon?: JSX.Element;
    title?: string;
}

export default function PanelHeader({ icon, title }: PanelHeaderProps) {
    return (
        <div className="panel-header">
            <div className="panel-header-icon">{icon}</div>
            <div className="panel-header-title">{title}</div>
        </div>
    );
}