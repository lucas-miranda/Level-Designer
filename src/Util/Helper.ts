import Point from '../Math/Point';

// math
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

// string
export function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function join(separator: string, values: any[], lastSeparator?: string): string {
    lastSeparator = lastSeparator === undefined ? separator : lastSeparator;
    let str = '';
    let i;
    for (i = 0; i < values.length - 2; i++) {
        str = str + values[i] + separator;
    }

    return str + values[i] + lastSeparator + values[i + 1];
}

// reflection
export function createInstance(module: any, className: string, ...args: any[]): any {
    return new module[className](...args);
}
