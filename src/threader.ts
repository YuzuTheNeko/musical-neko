import { ChildProcess, execFile, fork, spawn } from "child_process"
import { Collection } from "discord.js"
import { join } from "path"
import { createInterface } from "readline"
import config from "./config.json"
import log from "./functions/log"
const BOT_LAUNCHER = `BOT LAUNCHER` as const 

const bots = new Collection<number, ChildProcess>()

/**
 * Used to run multiple bots at a time
 */
async function main() {
    for (let i = 0;i < config.tokens.length;i++) {
        log(BOT_LAUNCHER, `Spawning bot ${i}...`)
        
        const child = await spawnBot(i)
        
        log(BOT_LAUNCHER, `Thread ${i} spawned!`)
        
        bots.set(i, child)
    }    
}

async function respawnBot(index: number) {
    log(BOT_LAUNCHER, `Respawning bot ${index}...`)
        
    const child = await spawnBot(index)
    
    log(BOT_LAUNCHER, `Thread ${index} spawned!`)
    
    bots.set(index, child)
}

async function spawnBot(index: number) {
    const thread = fork(join(process.cwd(), `dist`, `index.js`), {
        execArgv: [ 'dist/index.js', index.toString() ],
        stdio: "inherit"
    })
        
    await new Promise(resolve => {
        thread.on("spawn", resolve)
    })

    const prefix = `BOT ${index}`

    thread.once("close", (code) => {
        log(prefix, `Exited with code ${code}`)
        bots.delete(index)
    })
    
    thread.once("disconnect", () => {
        log(prefix, `Disconnected`)
        bots.delete(index)
    })
    
    thread.once("error", (err) => log(prefix, err.stack))
    thread.on('message', (message, sendHandle) => {
        process.emit("message", message, sendHandle)
    })
    
    return thread
}

main()

type MessageData = {
    type: "kill",
    index: number
} | {
    type: "respawn",
    index: number
} | {
    type: "respawnAll"
} | {
    type: "killAll"
}

async function onMessage(message: MessageData) {
    switch (message.type) {
        case 'respawnAll': {
            log(BOT_LAUNCHER, `Respawning all threads...`)
            for (const [, bot] of bots) {
                bot.kill('SIGKILL')
                await new Promise(resolve => bot.once("close", resolve))
            }

            // This is incase they were not killed yet
            bots.clear()

            log(BOT_LAUNCHER, `Relaunching now...`)
            main()
            break
        }

        case 'respawn': {
            if (!config.tokens[message.index]) return log(BOT_LAUNCHER, `There is no bot to respawn at that index.`)
            log(BOT_LAUNCHER, `Respawning bot at index ${message.index}...`)
            const current = bots.get(message.index)
            if (current) {
                current.kill('SIGKILL')
                await new Promise(resolve => current.once("close", resolve))
            }

            const child = await spawnBot(message.index)
            bots.set(message.index, child)
            
            log(BOT_LAUNCHER, `Thread ${message.index} has been respawned!`)
            break
        }

        case 'killAll': {
            log(BOT_LAUNCHER, `Exiting process...`)
            for (const [, thread] of bots) thread.kill('SIGKILL')
            process.exit()
        }

        case 'kill': {
            if (!bots.has(message.index)) {
                log(BOT_LAUNCHER, `Failed to kill thread ${message.index}, it does not exist`)
                return;
            }

            log(BOT_LAUNCHER, `Killing thread ${message.index}...`)
            const bot = bots.get(message.index)!
            
            bot.kill('SIGKILL')
            await new Promise(resolve => bot.once("close", resolve))

            log(BOT_LAUNCHER, `Thread ${message.index} killed!`)

            break
        }

        default: {
            log(BOT_LAUNCHER, `Received unknown message:`, message)
            break
        }
    }
}

process.on("message", onMessage)

function bash() {
    const readline = createInterface({
        input: process.stdin,
        output: process.stdout
    });
      
    readline.resume()
    readline.on("line", (got) => {
        try {
            const json = JSON.parse(got)
            onMessage(json)
        } catch {
            log(BOT_LAUNCHER, `Failed to parse JSON '${got}'`)
        }
    })
}

bash()