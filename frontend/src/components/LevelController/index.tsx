import { ConfigProvider, Slider } from "antd";
import "./index.css";

interface LevelControllerProps {
	level: number;
	disabled: boolean;
	maxLevel: number;
	onChange: (value: number) => void;
}

export default function LevelController({level, disabled, maxLevel, onChange}: LevelControllerProps) {
	return (
		<ConfigProvider theme={{ components: { Slider: { railSize: 10, railBg: "#E0E0E0", railHoverBg: "#E0E0E0", trackBg: "#fff", trackHoverBg: "#fff", handleColor: "#666" } } }}>
			<div className="level-controller">
				<span className="level-controller-title" style={{ fontSize: "16px" }}>Approximation Level</span>
				<Slider
					disabled={disabled}
					value={level}
					max={maxLevel}
					onChange={onChange}
				></Slider>
				<span style={{ fontSize: "16px" }}>{level}</span>
			</div>
		</ConfigProvider>
	);
}