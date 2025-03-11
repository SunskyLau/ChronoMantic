const colors = [
  "#33a0ff",
  "#ff1a1d",
  "#005e5b",
  "#ce6cff",
  "#ffb75b",
  "#490097",
  "#f781bf",
  "#0047bd",
  "#b15928",
  "#ff7f00",
  "#bd0000",
  "#33a02c",
  "#ff0086",
];

export function getColor(index: number) {
  return colors[index % colors.length];
}

export function getColorFromMap(colorMap: Record<string, string>, source?: number, opacity = "cc") {
  const color = colorMap[source?.toString() ?? ""];
  return color ? color + opacity : "";
}
