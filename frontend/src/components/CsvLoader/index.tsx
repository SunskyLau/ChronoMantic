import "./index.css";
import Papa from "papaparse";
import { useRef } from "react";
import { useAppDispatch } from "../../app/hooks";
import { setDataset, Dataset, ColumnType } from "../../app/slice/datasetSlice";
import UploadIcon from "../../icons/Upload";
import { datasetApi } from "../../api";
import { setQueryResults, setResults } from "../../app/slice/approximation";
import { Unit } from "../../types/QuerySpec";
import { getUnitBySeconds } from "../../utils/query-spec";

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
		datasetApi.uploadCsvFile(file).then((res) => {
			Papa.parse<Record<string, ColumnType>>(file, {
				header: true,
				dynamicTyping: true,
				complete: (result) => {
					const dataset: Dataset = {
						filename: res.filename,
						data: {},
						timeStampColumn: result.meta.fields?.[0] ?? "",
						timeStampColumnType: Unit.NUMBER,
						valueColumns: result.meta.fields?.slice(1) ?? [],
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
								dataset.timeStampColumnType = getUnitBySeconds(delta / 1000);
							}
							dataset.data[key].push(value);
						}
					});
					dispatch(setDataset(dataset));
					dispatch(setQueryResults({}));
					datasetApi.processDataset({ time_column: dataset.timeStampColumn, value_columns: dataset.valueColumns }).then((res) => {
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
