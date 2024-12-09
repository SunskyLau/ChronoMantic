import "./index.css";
import Papa from "papaparse";
import { useRef } from "react";
import { useAppDispatch } from "../../app/hooks";
import { setDataset, Dataset } from "../../app/slice/datasetSlice";
import UploadIcon from "../../icons/Upload";
import { uploadCsvFile } from "../../api";

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

  const parseCSV = (file: File) => {
    uploadCsvFile(file).then(res => {
      Papa.parse<Record<string, number | string>>(file, {
        header: true,
        dynamicTyping: true,
        complete: (result) => {
          const dataset: Dataset = {
            timeStamp: [],
            datasetName: res.filename,
            data: {},
            timeStampColumnName: result.meta.fields?.shift() || ""
          };
  
          result.data.forEach(row => {
            for (const [key, value] of Object.entries(row)) {
              if (!value) continue;
              if (key === dataset.timeStampColumnName) {
                dataset.timeStamp.push(value.toString());
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
    })
  };

  return (
    <div className="csv-loader" onClick={handleClickLoadIcon}>
      <UploadIcon></UploadIcon>
      <input ref={fileInputRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleFileLoad} />
    </div>
  );
}

export default CsvLoader;
