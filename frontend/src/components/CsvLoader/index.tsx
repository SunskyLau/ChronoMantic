import "./index.css";
import Papa from "papaparse";
import { useRef } from "react";
import { useAppDispatch } from "../../app/hooks";
import { setDataset, Dataset } from "../../app/slice/datasetSlice";
import { sendDataset } from "../../api";

function CsvLoader() {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClickLoadIcon = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // 重置文件输入框的值
      fileInputRef.current.click();
    }
  };

  const handleFileLoad = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    parseCSV(file);
  };

  const parseCSV = async (file: File) => {
    const res = await sendDataset(file);
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (result) => {
        const dataset: Dataset = {
          timeStamp: [],
          datasetName: file.name,
          data: {},
          id: res.id
        };

        // 假设第一列是时间戳
        const timeColumnName = result.meta.fields?.[0] || "";

        result.data.forEach((row: any) => {
          for (const [key, value] of Object.entries(row)) {
            if (key === timeColumnName) {
              dataset.timeStamp.push(String(value));
            } else {
              if (!dataset.data[key]) {
                dataset.data[key] = [];
              }
              dataset.data[key].push(typeof value === "number" ? value : NaN);
            }
          }
        });

        console.log("Parsed dataset:", dataset);
        dispatch(setDataset(dataset));
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
      },
    });
  };

  return (
    <div id="csv-loader" onClick={handleClickLoadIcon}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M16.0001 6.00004L16.0001 19.3334M16.0001 6.00004C15.0664 6.00004 13.3221 8.65911 12.6667 9.33337M16.0001 6.00004C16.9337 6.00004 18.678 8.65911 19.3334 9.33337"
          stroke="#ACACAC"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M26.6667 22C26.6667 25.3093 25.976 26 22.6667 26H9.33337C6.02404 26 5.33337 25.3093 5.33337 22"
          stroke="#ACACAC"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <input ref={fileInputRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleFileLoad} />
    </div>
  );
}

export default CsvLoader;
