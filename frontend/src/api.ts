import axios from "axios";
import { Intentions, QuerySpec, QuerySpecWithSource, Segment } from "./types/QuerySpec";
import { DatasetInfo, ApproximationSegmentsContainers, ApproximationResults } from "./types";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000", // 替换为你的后端API地址
  timeout: 2000000, // 可选的超时设置
  headers: {
    "Content-Type": "application/json",
  },
});

export const getQuerySpecRequest = async (nl_query: string): Promise<QuerySpecWithSource> => {
  console.log("Sending query spec request");
  try {
    const response = await api.post(`/api/parse_nl_query`, { nl_query });
    console.log(response.data);
    return response.data.results;
  } catch (error) {
    console.error("Error sending query spec request:", error);
    throw error;
  }
};

export const adjustQuerySpec = async (query: string): Promise<string> => {
  console.log("Sending query spec request");
  try {
    const response = await api.post(`/api/tune_query`, { query });
    console.log(response.data);
    return response.data.results;
  } catch (error) {
    console.error("Error sending query spec request:", error);
    throw error;
  }
};

export const uploadCsvFile = async (file: File) => {
  console.log("Sending csv file:", file.name);
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/api/upload_csv_file", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending csv file:", error);
    throw error;
  }
}

export const processDataset = async (datasetInfo: DatasetInfo): Promise<ApproximationSegmentsContainers> => {
  console.log("Sending process dataset request");
  try {
    const response = await api.post(`/api/process_dataset`, { datasetInfo });
    console.log(response.data);
    return response.data.approximationSegmentsContainers;
  } catch (error) {
    console.error("Error sending process dataset request:", error);
    throw error;
  }
}

export const getScaleRatio = async (csvName: string, timeStampColumnName: string, valueColumnName: string): Promise<number> => {
  console.log("Sending scale ratio request");
  try {
    const response = await api.post(`/api/get_scale_ratio`, { csvName, timeStampColumnName, valueColumnName });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending scale ratio request:", error);
    throw error;
  }
}

export const getFragmentsBySpec = async (querySpec: QuerySpec): Promise<ApproximationResults> => {
  console.log("Sending fragments request");
  try {
    const response = await api.post(`/api/query_by_specification`, {
      querySpec: {
        ...querySpec,
        trends: querySpec.trends?.map(trend => {
          const { index, ...newTrend } = trend;
          return newTrend;
        })
      }
    });
    console.log(response.data);
    return response.data.results;
  } catch (error) {
    console.error("Error sending fragments request:", error);
    throw error;
  }
}

export const getQueryByTS = async (source: string, segments: Segment[], choices: string[]): Promise<string[]> => {
  console.log("Sending query_by_ts request");
  try {
    const response = await api.post(`/api/query_by_ts`, { segments, source, choices });
    console.log(response.data);
    return response.data.results;
  } catch (error) {
    console.error("Error sending fragments request:", error);
    throw error;
  }
}

let abortController: AbortController | null = null;

export const abortRequest = () => {
  if (abortController) {
    abortController.abort();
    console.log("Request aborted manually");
    abortController = null;
  }
};

export const getSearchPrompt = async (query: string): Promise<string[]> => {
  console.log("Sending search_prompt request");

  abortRequest();
  abortController = new AbortController();
  const signal = abortController.signal;

  try {
    const response = await api.post(`/api/search_prompt`, { query }, { signal });
    console.log(response.data);
    return response.data.results;
  } catch (error) {
    console.error("Error sending search_prompt request:", error);
    throw error;
  }
};

export const getModifyPrompt = async (old_queryspec_with_source: QuerySpecWithSource | null, segments: Segment[], segment_group_ids: [number, number][], intentions: Intentions): Promise<QuerySpecWithSource> => {
  console.log("Sending modify_nl_query request");
  try {
    const response = await api.post(`/api/modify_nl_query`, { old_queryspec_with_source, segments, segment_group_ids, intentions });
    console.log(response.data);
    return response.data.results;
  } catch (error) {
    console.error("Error sending modify_prompt request:", error);
    throw error;
  }
}

export const addChatHistory = async(user_prompt: string, assistant_prompt: string)=>{
  try{
    const response = await api.post(`/api/add_chat_history`, { user_prompt, assistant_prompt });
    console.log(response.data);
    return response.data.results;
  } catch (error) {
    console.error("Error sending add_chat_history request:", error);
    throw error;
  }
}