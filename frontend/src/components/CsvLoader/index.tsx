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
						timeStampColumn: "",
						valueColumns: [],
						ratios: {},
					};

					result.data.forEach((row) => {
						for (const [key, value] of Object.entries(row)) {
							if (!dataset.data[key]) {
								dataset.data[key] = [];
								if (typeof value === "number") {
									dataset.valueColumns.push(key);
								} else {
									dataset.timeStampColumn = key;
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
