import { Button, Divider, Empty, Flex, Select, Typography } from "antd";
import { Attribute, Comparator, Relation as RelationType } from "../../../types/QuerySpec";
import { deepClone } from "../../../utils/deepclone";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";

interface RelationProps {
    title?: string;
    relations: RelationType[];
    idLength: number;
    isEdit?: boolean;
    onChange: (relations: RelationType[]) => void;
}

export default function Relation({ title, relations, idLength, isEdit, onChange }: RelationProps) {
    return (
        <>
            <Flex justify="space-between" align="center">
                <Typography.Title level={4} keyboard>{title ?? 'Relation'}</Typography.Title>
                {isEdit && <Button icon={<PlusOutlined />} onClick={() => {
                    const newRelations = deepClone(relations);
                    newRelations.push({});
                    onChange(newRelations);
                }}></Button>}
            </Flex>
            {!relations.length ? <Empty description="no relations"></Empty> : relations.map((relation, index) => (
                <div key={index}>
                    <Flex gap={4}>
                        <Select placeholder="attribute" popupMatchSelectWidth={false} options={Object.values(Attribute).map(attr => ({ value: attr, label: attr }))} value={relation.attribute} onChange={(value) => {
                            const newRelations = deepClone(relations);
                            newRelations[index].attribute = value;
                            onChange(newRelations);
                        }}></Select>
                        <Select placeholder="id1" popupMatchSelectWidth={false} value={relation.id1} options={Array.from({ length: idLength }, (_, i) => ({ value: i }))} onChange={(value) => {
                            const newRelations = deepClone(relations);
                            newRelations[index].id1 = value;
                            onChange(newRelations);
                        }}></Select>
                        <Select popupMatchSelectWidth={false} placeholder="comparator" options={Object.values(Comparator).map(attr => ({ value: attr, label: attr }))} value={relation.comparator} onChange={(value) => {
                            const newRelations = deepClone(relations);
                            newRelations[index].comparator = value;
                            onChange(newRelations);
                        }} />
                        <Select placeholder="id2" popupMatchSelectWidth={false} value={relation.id2} options={Array.from({ length: idLength }, (_, i) => ({ value: i }))} onChange={(value) => {
                            const newRelations = deepClone(relations);
                            newRelations[index].id2 = value;
                            onChange(newRelations);
                        }}></Select>
                        {isEdit && <Button type="primary" style={{ marginLeft: 'auto' }} icon={<MinusOutlined />} danger onClick={() => {
                            const newRelations = deepClone(relations);
                            newRelations.splice(index, 1);
                            onChange(newRelations);
                        }}></Button>}
                    </Flex>
                    <Divider></Divider>
                </div>
            ))}
        </>
    )
}