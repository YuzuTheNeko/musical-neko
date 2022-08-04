import { ApplicationCommandType, ClientEvents, Collection, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";
import { readdirSync } from "fs";
import { Client } from "genius-lyrics";
import log from "../functions/log";
import toTitleCase from "../functions/toTitleCase";
import { Command } from "../structures/Command";
import { MapValue } from "../typings/types/MapValue";
import { Method } from "../typings/types/Method";
import { Lavalink } from "./Lavalink";
import { NekoClient } from "./NekoClient";
import config from "../config.json";
import Parser from "ms-utility";

export class NekoManager {
    lavalink: Lavalink
    genius = new Client(config.geniusAccessToken)
    parser = new Parser()

    commands = new Collection<string, Command>()

    events = new Collection<keyof ClientEvents, Method<ClientEvents[keyof ClientEvents], Promise<void> | void>>()
    
    constructor(
        readonly client: NekoClient
    ) {
        this.lavalink = new Lavalink(this.client)
    }

    loadEvents(refresh = false) {
        if (refresh) {
            this.events.clear()
        }

        for (const file of readdirSync(`dist/events/discord.js`)) {
            const name = file.split('.js')[0] as keyof ClientEvents
            const path = `../events/discord.js/${file}`

            if (refresh) {
                delete require.cache[require.resolve(path)]
            }

            const event: MapValue<typeof this["events"]> = require(path).default.bind(this.client)

            this.client.on(name, event)
        }
    }

    loadCommands(refresh = false) {
        if (refresh) {
            this.commands.clear()
        }

        for (const folder of readdirSync(`dist/commands`)) {
            for (const file of readdirSync(`dist/commands/${folder}`)) {
                const path = `../commands/${folder}/${file}`

                if (refresh) {
                    delete require.cache[require.resolve(path)]
                }

                const command: Command = require(path).default

                if (!command.data.category) command.data.category = folder

                if (command.isOwnerCategory()) {
                    command.data.owner = true 
                }

                this.commands.set(command.name, command)
            }
        }
    }

    asSlashCommands(include?: string[], exclude?: string[]): RESTPostAPIChatInputApplicationCommandsJSONBody[] {
        const arr = new Array<RESTPostAPIChatInputApplicationCommandsJSONBody>()

        if (this.commands.size === 0) this.loadCommands()

        for (const folder of readdirSync(`dist/commands`)) {
            if (include !== undefined && !include.includes(folder)) {
                continue
            }

            if (exclude !== undefined && exclude.includes(folder)) {
                continue
            }

            const commands = this.commands.filter(c => c.category === folder)

            if (commands.size === 0) {
                continue
            }

            const initial: RESTPostAPIChatInputApplicationCommandsJSONBody = {
                name: folder,
                dm_permission: false,
                description: `${toTitleCase(folder)} Commands (${commands.size.toLocaleString()})`,
                type: ApplicationCommandType.ChatInput,
                options: []
            }

            for (const [, command] of commands) {
                initial.options!.push(command.asSlashOption())
            }

            arr.push(initial)
        }

        return arr 
    }

    log(...args: unknown[]) {
        log('MANAGER', ...args)
    }

    get playCommand() {
        return this.commands.get("play")!
    }
}