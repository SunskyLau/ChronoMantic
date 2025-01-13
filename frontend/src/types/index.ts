import { Segment } from "./QuerySpec";


export interface DataPoint {
    x: number;
    y: number;
}

export interface TimeSeries {
    x: number[];
    y: number[];
}

export type TimeSeriesDataset = Record<string, TimeSeries>;

export interface ProcessDatasetResults {
    metadataDict: Record<string, Record<string, string[]>>;
    tableInfo: {
        id_column: string;
        time_column: string;
        value_column: string;
        metadata_columns: string[];
    };
    timeSeriesDataset: TimeSeriesDataset;
}

export interface DatasetInfo {
    time_column: string;
    value_columns: string[];
}

export interface Approximation_segment {
    approximation_level: number;
    segments: Segment[];
}

export type ApproximationSegmentsContainers = {
    source: string;
    max_approximation_level: number;
    approximation_segments_list: Approximation_segment[];
}[]