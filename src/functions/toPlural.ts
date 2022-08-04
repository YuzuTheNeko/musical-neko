export function toPlural<T extends string, I extends number>(str: T, amount: I, other?: string): string {
    return amount === 1 ? str : other ?? str + 's'
}

export function toPluralAmount<T extends string, I extends number>(str: T, amount: I, other?: string): string {
    return `${amount.toLocaleString()} ${toPlural(str, amount, other)}`
}