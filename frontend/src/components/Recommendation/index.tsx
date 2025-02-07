import { Card, Flex, Typography } from "antd";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import "./index.css";
import { setNLQuery, setQuery } from "../../app/slice/stateSlice";
import { getQuerySpecRequest } from "../../api";
import { setIsRequesting } from "../../app/slice/resultsSlice";


export default function Recommendation() {
    const querys = useAppSelector(state => state.states.querys);
    const isRequesting = useAppSelector(state => state.results.isRequesting);
    const dispatch = useAppDispatch();
    return (
        <Flex gap={12} className="recommendation">
            {querys.map((query, index) => {
                return <Card key={index}>
                    <Typography.Paragraph disabled={isRequesting} ellipsis={{ rows: 2, tooltip: true }} onClick={() => {
                        dispatch(setQuery(null));
                        dispatch(setIsRequesting(true));
                        dispatch(setNLQuery(query));
                        getQuerySpecRequest(query).then(res => {
                            dispatch(setQuery(res));
                        }).finally(() => {
                            dispatch(setIsRequesting(false));
                        });
                    }}>{query}</Typography.Paragraph>
                </Card>
            })}
        </Flex>
    )
}