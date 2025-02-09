import { Card, Flex, Typography } from "antd";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import "./index.css";
import { setNLQuery, setQuery, setQuerySpec } from "../../app/slice/stateSlice";
import { getQuerySpecRequest } from "../../api";
import { setIsRequesting } from "../../app/slice/resultsSlice";
import { useEffect } from "react";


export default function Recommendation() {
    const querys = useAppSelector(state => state.states.querys);
    const isRequesting = useAppSelector(state => state.results.isRequesting);
    const dispatch = useAppDispatch();

    useEffect(() => {
        window.dispatchEvent(new Event("resize"));
    }, [querys.length])

    return (
        <Flex gap={'var(--gap)'} className="recommendation">
            {querys.map((query, index) => {
                return <Card key={index}>
                    <Typography.Paragraph disabled={isRequesting} ellipsis={{ rows: 2, tooltip: true }} onClick={() => {
                        dispatch(setQuery(null));
                        dispatch(setIsRequesting(true));
                        dispatch(setNLQuery(query));
                        getQuerySpecRequest(query).then(res => {
                            dispatch(setQuerySpec(res));
                        }).finally(() => {
                            dispatch(setIsRequesting(false));
                        });
                    }}>{query}</Typography.Paragraph>
                </Card>
            })}
        </Flex>
    )
}