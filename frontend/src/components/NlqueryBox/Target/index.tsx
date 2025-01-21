import { Select, Typography } from "antd";

interface TargetProps {
    title?: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
}

export default function Target({ title, value, options, onChange }: TargetProps) {
    return (
        <>
            <Typography.Title level={5} keyboard>{title ?? 'Target'}</Typography.Title>
            <Select
                allowClear
                popupMatchSelectWidth={false}
                value={value}
                onChange={onChange}
                options={options.map((value) => ({ value }))}
            ></Select>
        </>
    )
}