import axios from "axios";
import type { Results } from "./app/slice/resultsSlice";
import { Fragment, FragmentList, Query, QuerySpec, TimeGranularity } from "./types/QuerySpec";
import { DatasetInfo, ApproximationSegmentsContainers, ApproximationResults } from "./types";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000", // 替换为你的后端API地址
  timeout: 2000000, // 可选的超时设置
  headers: {
    "Content-Type": "application/json",
  },
});

export const getQuerySpecRequest = async (query: string): Promise<Query> => {
  console.log("Sending query spec request");
  try {
    const response = await api.post(`/api/parse_query`, { query });
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

export const getFragmentsByTimeGranularity = async (csvName: string, timeColumnName: string, valueColumnName: string, timeGranularity: TimeGranularity): Promise<FragmentList> => {
  console.log("Sending fragments request");
  try {
    const response = await api.post(`/api/get_fragments_by_time_granularity`, { csvName, timeColumnName, valueColumnName, timeGranularity });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending fragments request:", error);
    throw error;
  }
}

export const getQueryResult = async (querySpec: QuerySpec, fragmentList: FragmentList, optimalRatio: number): Promise<Results> => {
  console.log("Sending query result request");
  try {
    const { ...resQuerySpec } = querySpec;
    const response = await api.post(`/api/request_for_query`, { querySpec: resQuerySpec, fragmentList, optimalRatio });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending query result request:", error);
    throw error;
  }
}


interface QueryInFragmentsResponse {
  result_fragments: Fragment[];
  keeped_after_prune_fragments: Fragment[];
}

export const queryInFragments = async (querySpec: QuerySpec, fragments: Fragment[], optimalRatio: number): Promise<QueryInFragmentsResponse> => {
  console.log("Sending query in fragments request");
  try {
    const response = await api.post(`/api/query_in_fragments`, { querySpec, fragments, optimalRatio });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending query in fragments request:", error);
    throw error;
  }
}