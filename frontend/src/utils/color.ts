import { TextSource } from "../types/QuerySpec";

export function getColor(index: number) {
    const colors = [
        "#FF6B6B",
        "#4ECDC4",
        "#45B7D1",
        "#96CEB4",
        "#FFBE0B",
        "#9B5DE5",
        "#F15BB5",
        "#00BBF9",
        "#FF9F1C",
        "#2EC4B6",
        "#845EC2",
        "#D65DB1",
        "#FF8066",
        "#FFC75F",
        "#008F7A",
        "#4B4453",
        "#B0A8B9",
        "#C34A36"
    ];
    return colors[index % colors.length];
}

export function getColorFromMap(colorMap: Record<string, string>, source?: TextSource, opacity = "66") {
    const key = source?.text + "-" + source?.index;
    const color = colorMap[key];
    return color ? color + opacity : "";
}
