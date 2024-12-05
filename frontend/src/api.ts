import axios from "axios";
import type { Results, Trend } from "./app/slice/resultsSlice";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000", // 替换为你的后端API地址
  timeout: 200000, // 可选的超时设置
  headers: {
    "Content-Type": "application/json",
  },
});

// 发送自然语言查询请求，返回shapeQuery expression
export const sendNLQueryRequest = async (query: string) => {
  console.log("Sending search request:", query);
  try {
    const response = await api.post("/api/transformNL2Features", JSON.stringify(query));
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending search request:", error);
    throw error;
  }
};

export const sendDataset = async (file: File) => {
  console.log("Sending dataset file:", file.name);
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/api/readCsv", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending dataset:", error);
    throw error;
  }
};

interface RespondResult {
  results: Results;
  trend: Trend;
}

export const sendQueryDatasetRequest = async (datatset_id: string, query: string, k = 5): Promise<RespondResult> => {
  console.log("Sending query dataset request:", datatset_id, query);
  const params = new URLSearchParams();
  params.append("id", datatset_id);
  params.append("query", query);
  params.append("k", k.toString());
  try {
    const response = await api.get("/api/queryDataset", { params });
    console.log(response.data);
    return response.data;
  } catch(e) {
    console.error("Error sending query dataset request:", e);
    return Promise.reject(e);
  }
}

export const sendQueryTSRequest = async (ts: number[][]): Promise<string[][]> => {
  console.log("Sending query ts request:", ts);
  try {
    const response = await api.post("/api/queryTS", JSON.stringify(ts));
    console.log(response.data);
    return response.data;
  }catch (e) {
    console.error("Error sending query ts request:", e);
    return Promise.reject(e);
  }
}