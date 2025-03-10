export function getColor(index: number) {
    const colors = [
        "#FFA07A",
        "#6A5ACD",
        "#FFD700",
        "#FF69B4",
        "#00BFFF",
        "#90EE90",
        "#FF4500",
        "#DA70D6",
        "#00FA9A",
        "#FF8C00",
        "#BA55D3",
        "#32CD32",
        "#FF00FF",
        "#40E0D0",
        "#FFB6C1",
        "#2F4F4F",
        "#FFE4B5"
    ];
    return colors[index % colors.length];
}

export function getColorFromMap(colorMap: Record<string, string>, source?: number, opacity = "99") {
    const color = colorMap[source?.toString() ?? ""];
    return color ? color + opacity : "";
}
