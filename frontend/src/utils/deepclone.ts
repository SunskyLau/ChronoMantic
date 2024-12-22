export function deepClone<T>(value: T): T {
    if (value === null || typeof value !== "object") {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(deepClone) as unknown as T;
    }

    if (value instanceof Date) {
        return new Date(value.getTime()) as unknown as T;
    }

    if (value instanceof Map) {
        const result = new Map();
        value.forEach((v, k) => result.set(k, deepClone(v)));
        return result as unknown as T;
    }

    if (value instanceof Set) {
        const result = new Set();
        value.forEach(v => result.add(deepClone(v)));
        return result as unknown as T;
    }

    const result: Record<string, T[keyof T]> = {};
    for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
            result[key] = deepClone(value[key]);
        }
    }
    return result as T;
}
