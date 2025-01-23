import { Divider, Select, Typography } from "antd";
import { Attribute, Comparator, Relation as RelationType } from "../../../types/QuerySpec";
import { deepClone } from "../../../utils/deepclone";

interface RelationProps {
    title?: string;
    relations: RelationType[];
    idLength: number;
    onChange: (relations: RelationType[]) => void;
}

export default function Relation({ title, relations, idLength, onChange }: RelationProps) {
    return (
        <>
            <Typography.Title level={4} keyboard>{title ?? 'Relation'}</Typography.Title>
            {relations.map((relation, index) => (
                <div key={index}>
                    <Select popupMatchSelectWidth={false} options={Object.values(Attribute).map(attr => ({ value: attr, label: attr }))} value={relation.attribute} onChange={(value) => {
                        const newRelations = deepClone(relations);
                        newRelations[index].attribute = value;
                        onChange(newRelations);
                    }}></Select>
                    <Select popupMatchSelectWidth={false} value={relation.id1} options={Array.from({ length: idLength }, (_, i) => ({ value: i }))} onChange={(value) => {
                        const newRelations = deepClone(relations);
                        newRelations[index].id1 = value;
                        onChange(newRelations);
                    }}></Select>
                    <Select popupMatchSelectWidth={false} placeholder={'comparator'} options={Object.values(Comparator).map(attr => ({ value: attr, label: attr }))} value={relation.comparator} onChange={(value) => {
                        const newRelations = deepClone(relations);
                        newRelations[index].comparator = value;
                        onChange(newRelations);
                    }} />
                    <Select popupMatchSelectWidth={false} value={relation.id2} options={Array.from({ length: idLength }, (_, i) => ({ value: i }))} onChange={(value) => {
                        const newRelations = deepClone(relations);
                        newRelations[index].id2 = value;
                        onChange(newRelations);
                    }}></Select>
                    <Divider></Divider>
                </div>
            ))}
        </>
    )
}