import chalk from "chalk"

const start = performance.now()
import(`./${process.argv.slice(2).join(' ')}`).then(() => {
    console.log(
        chalk.green.bold(`File executed in ${performance.now() - start}ms.`)
    )
})