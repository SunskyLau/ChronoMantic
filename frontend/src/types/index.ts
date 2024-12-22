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