import { Button, Checkbox, Flex, Space, Typography } from "antd";
import { IntentionPopoverProps } from "./types";
import { GroupChoice, GroupRelationChoice, SingleChoice, SingleRelationChoice } from "../../types/QuerySpec";

function IntentionPopover<T extends SingleChoice | GroupChoice | SingleRelationChoice | GroupRelationChoice>({ 
    type, 
    choices, 
    selected, 
    onChange, 
    onCancel, 
    onConfirm, 
    onDelete, 
    isExisting 
}: IntentionPopoverProps<T>) {
    return (
        <div>
            <Flex justify="space-between" align="center">
                <Typography.Paragraph keyboard>{type}</Typography.Paragraph>
                {isExisting && (
                    <Button danger type="text" onClick={onDelete} style={{ marginLeft: 8 }}>
                        Delete
                    </Button>
                )}
            </Flex>
            <Space direction="vertical">
                {choices.map((choice) => (
                    <Checkbox
                        key={choice}
                        checked={selected.includes(choice)}
                        onChange={() => onChange(choice)}
                    >
                        {choice.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                    </Checkbox>
                ))}
            </Space>
            <Flex justify="flex-end" gap={8} style={{ marginTop: 16 }}>
                <Button onClick={onCancel}>Cancel</Button>
                <Button type="primary" onClick={onConfirm} disabled={selected.length === 0}>
                    Confirm
                </Button>
            </Flex>
        </div>
    );
}

export default IntentionPopover; 