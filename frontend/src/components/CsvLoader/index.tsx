import "./index.css";
import Papa from "papaparse";
import { useRef } from "react";
import { useAppDispatch } from "../../app/hooks";
import { setDataset, Dataset, ColumnType } from "../../app/slice/datasetSlice";
import UploadIcon from "../../icons/Upload";
import { processDataset, uploadCsvFile } from "../../api";
import { setResults } from "../../app/slice/approximation";

function CsvLoader() {
	const dispatch = useAppDispatch();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleClickLoadIcon = () => {
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
			fileInputRef.current.click();
		}
	};

	const handleFileLoad = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;
		parseCSV(file);
	};

	const parseCSV = (file: File) => {
		uploadCsvFile(file).then((res) => {
			Papa.parse<Record<string, ColumnType>>(file, {
				header: true,
				dynamicTyping: true,
				complete: (result) => {
					const dataset: Dataset = {
						filename: res.filename,
						data: {},
						timeStampColumn: result.meta.fields?.[0] ?? "",
						timeStampColumnType: "number",
						valueColumns: result.meta.fields?.slice(1) ?? []
					};

					let lastTimeStamp = 0;
					result.data.forEach((row) => {
						for (const [key, value] of Object.entries(row)) {
							if (!key || value === null) continue;
							if (!dataset.data[key]) {
								dataset.data[key] = [];
							}
							if (key === dataset.timeStampColumn && typeof value === "string" && !isNaN(new Date(value).getTime())) {
								const timeStamp = new Date(value).getTime();
								const delta = timeStamp - lastTimeStamp;
								lastTimeStamp = timeStamp;
								if (delta >= 86400000) {
									dataset.timeStampColumnType = "day";
								} else if (delta >= 3600000) {
									dataset.timeStampColumnType = "hour";
								} else if (delta >= 60000) {
									dataset.timeStampColumnType = "minute";
								} else if (delta >= 1000) {
									dataset.timeStampColumnType = "second";
								}
							}
							dataset.data[key].push(value);
						}
					});
					dispatch(setDataset(dataset));
					processDataset({ time_column: dataset.timeStampColumn, value_columns: dataset.valueColumns }).then((res) => {
						dispatch(setResults(res));
					});
				},
				error: (error) => {
					console.error("Error parsing CSV:", error);
				},
			});
		});
	};

	return (
		<div
			className="csv-loader"
			onClick={handleClickLoadIcon}
		>
			<UploadIcon></UploadIcon>
			<input
				ref={fileInputRef}
				type="file"
				accept=".csv"
				className="hidden"
				onChange={handleFileLoad}
			/>
		</div>
	);
}

export default CsvLoader;
