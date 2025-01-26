import { Flex, Select, Typography } from "antd";

interface TargetProps {
    title?: string;
    disabled?: boolean;
    value: string;
    options: string[];
    onChange: (value: string) => void;
}

export default function Target({ disabled, title, value, options, onChange }: TargetProps) {
    return (
        <Flex align="center" justify="space-between" gap={16}>
            <Typography.Title level={4} keyboard style={{ marginBottom: 0 }}>{title ?? 'Target'}</Typography.Title>
            <Select
                disabled={disabled}
                allowClear
                popupMatchSelectWidth={false}
                value={value}
                onChange={onChange}
                options={options.map((value) => ({ value }))}
            ></Select>
        </Flex>
    )
}