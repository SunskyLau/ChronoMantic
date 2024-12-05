export function getColor(index: number) {
    const colors = [
        "#89CAFF80",
        "#FF9B4F80",
        "#53C70080",
        "#FFD70080",
        "#FF00FF80"
    ];
    return colors[index % colors.length];
}