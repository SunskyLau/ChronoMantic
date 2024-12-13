import { classnames } from "../../../../utils/classname"
import "./index.css"

export default function Overview({ className, children }: { className?: string, children?: React.ReactNode }) {
    return (<div className={classnames("result-overview", className)}>
        {children}
    </div>)
}