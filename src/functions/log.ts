import chalk from "chalk";

export default function log<T extends [...any[]]>(name: string, ...args: [...T]) {
    console.log(`[${chalk.green.bold(name)}]`, `[${chalk.cyan.bold(new Date().toLocaleString())}]`, ...args)
}