import { setLevel } from "../../app/slice/approximation";
import { ConfigProvider, Slider } from "antd";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import "./index.css";

export default function LevelController() {
	const dispatch = useAppDispatch();
	const valueCol = useAppSelector((state) => state.approximation.source);
	const results = useAppSelector((state) => state.approximation.results);
	const current = results?.find((result) => result.source === valueCol);
	const level = useAppSelector((state) => state.approximation.level);

	return (
		<ConfigProvider theme={{ components: { Slider: { railSize: 10, railBg: "#E0E0E0", railHoverBg: "#E0E0E0", trackBg: "#fff", trackHoverBg: "#fff", handleColor: "#666" } } }}>
			<div className="level-controller">
				<span className="level-controller-title">Approximation Level</span>
				<Slider
					disabled={!current}
					value={level}
					max={current?.max_approximation_level}
					onChange={(val) => {
						dispatch(setLevel(val));
					}}
				></Slider>
				<span>{level}</span>
			</div>
		</ConfigProvider>
	);
}