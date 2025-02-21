import { ConfigProvider, Slider } from "antd";
import { useAppSelector } from "../../app/hooks";
import "./index.css";

interface LevelControllerProps {
	level: number;
	onChange: (value: number) => void;
}

export default function LevelController({level, onChange}: LevelControllerProps) {
	const valueCol = useAppSelector((state) => state.approximation.source);
	const results = useAppSelector((state) => state.approximation.results);
	const current = results?.find((result) => result.source === valueCol);

	return (
		<ConfigProvider theme={{ components: { Slider: { railSize: 10, railBg: "#E0E0E0", railHoverBg: "#E0E0E0", trackBg: "#fff", trackHoverBg: "#fff", handleColor: "#666" } } }}>
			<div className="level-controller">
				<span className="level-controller-title" style={{ fontSize: "16px" }}>Approximation Level</span>
				<Slider
					disabled={!current}
					value={level}
					max={current?.max_approximation_level}
					onChange={onChange}
				></Slider>
				<span style={{ fontSize: "16px" }}>{level}</span>
			</div>
		</ConfigProvider>
	);
}