export function formatTime(time: Date | number | string, detail: "day" | "hour" | "minute" | "second" = "day"): string {
    const date: Date = new Date(time);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    const str = `${year}/${month}/${day} ${hour}:${minute}:${second}`;
    return str.slice(0, detail === "day" ? 10 : detail === "hour" ? 13 : detail === "minute" ? 16 : 19);
}