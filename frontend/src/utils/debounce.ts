export function debounce<T>(func: (...args: T[]) => void, wait: number) {
    let timeout: NodeJS.Timeout | null = null;

    return function (...args: T[]) {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };
}
