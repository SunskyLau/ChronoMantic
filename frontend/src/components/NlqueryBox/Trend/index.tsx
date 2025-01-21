import { Checkbox, Divider, InputNumber, Typography } from "antd";
import { Trend as TrendType } from "../../../types/QuerySpec";
import { deepClone } from "../../../utils/deepclone";

interface TrendProps {
    title?: string;
    trends: TrendType[];
    onChange: (trends: TrendType[]) => void;
}

export default function Trend({ title, trends, onChange }: TrendProps) {
    return (
        <>
            <Typography.Title level={5} keyboard>{title ?? 'Trend'}</Typography.Title>
            {trends.map((trend, index) => (
                <div key={index}>
                    <Typography.Paragraph>No.{index}</Typography.Paragraph>
                    {Object.keys(trend).map(key => {
                        const k = key as keyof typeof trend;
                        return (
                            <span key={k}>
                                <Typography.Paragraph>{k}</Typography.Paragraph>
                                <Typography.Text>MIN</Typography.Text>
                                <InputNumber className="ml-1" value={trend[k]?.min?.value} onChange={(value) => {
                                    const newTrends = deepClone(trends);
                                    if (!value) newTrends[index][k] = { ...newTrends[index][k], min: null };
                                    else newTrends[index][k] = { ...newTrends[index][k], min: { value, inclusive: trend[k]?.min?.inclusive } };
                                    onChange(newTrends);
                                }} />
                                <Checkbox className="ml-1" checked={trend[k]?.min?.inclusive} disabled={!trend[k]?.min?.value} onChange={(e) => {
                                    const newTrends = deepClone(trends);
                                    newTrends[index][k] = { ...newTrends[index][k], min: { value: trend[k]?.min?.value, inclusive: e.target.checked } };
                                    onChange(newTrends);
                                }}></Checkbox>
                                <br></br>
                                <Typography.Text>MAX</Typography.Text>
                                <InputNumber className="ml-1" value={trend[k]?.max?.value} onChange={(value) => {
                                    const newTrends = deepClone(trends);
                                    if (!value) newTrends[index][k] = { ...newTrends[index][k], max: null };
                                    else newTrends[index][k] = { ...newTrends[index][k], max: { value, inclusive: trend[k]?.max?.inclusive } };
                                    onChange(newTrends);
                                }} />
                                <Checkbox className="ml-1" checked={trend[k]?.max?.inclusive} disabled={!trend[k]?.max?.value} onChange={(e) => {
                                    const newTrends = deepClone(trends);
                                    newTrends[index][k] = { ...newTrends[index][k], max: { value: trend[k]?.max?.value, inclusive: e.target.checked } };
                                    onChange(newTrends);
                                }}></Checkbox>
                            </span>
                        )
                    })}
                    <Divider></Divider>
                </div>
            ))}
        </>
    )
}