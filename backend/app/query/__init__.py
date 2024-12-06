import pandas as pd
from app.query.MyTypes import Fragment, QuerySpec, TrendConfig
from app.config import Config
from app.query.process_fragment import calculate_fragment_theta, determine_trends, generate_fragments


def if_satisfy_query(fragment: Fragment, querySpec: QuerySpec):
    if len(fragment.segments) != len(querySpec.trends):
        return False
    for i, segment in enumerate(fragment.segments):
        if segment.trend != querySpec.trends[i]:
            return False
    return True


def query(querySpec: QuerySpec, csv_name: str, ratio: float, trendConfig: TrendConfig):
    df = pd.read_csv(Config.UPLOAD_FOLDER + csv_name)
    values = df[querySpec.value_column_name].values
    time_stamps = pd.to_datetime(df[querySpec.time_stamp_column_name]).astype(int) // 10**9
    fragments = generate_fragments(time_stamps, values, querySpec)

    results = []
    for fragment in fragments:
        fragment = calculate_fragment_theta(fragment, ratio)
        fragment = determine_trends(fragment, trendConfig)
        if if_satisfy_query(fragment, querySpec):
            results.append(fragment)

    return results
