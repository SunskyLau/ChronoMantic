import Block from "../Block";
import "./index.css";

const choices = ["template", "clustering", "example"];

export default function Recommendation() {
    return (
        <Block title="Recommendation" className="recommendation">
            <div className="recommendation-choices">
                {choices.map(choice => (
                    <div className="recommendation-choice" key={choice}>{choice}</div>
                ))}
            </div>
            <div className="recommendation-content">1</div>
        </Block>
    )
}