import { APIEmbed, Client, ClientOptions, ColorResolvable, Colors, EmbedData, EmbedBuilder, User } from "discord.js";
import log from "../functions/log";
import { NekoManager } from "./NekoManager";
import config from "../config.json"
import { Nullable } from "../typings/types/Nullable";
import { argv } from "process";

export class NekoClient extends Client<true> {
    manager = new NekoManager(this)

    constructor(options: ClientOptions) {
        super(options)
    }

    get prefix() {
        return config.prefixes[this.index]
    }

    get index() {
        return Number(argv[2])
    }

    public login(): Promise<string> {
        return super.login(config.tokens[this.index])
    }

    get config() {
        return config
    }

    log(...args: unknown[]) {
        log('CLIENT', ...args)
    }

    embedError(user: Nullable<User>, title: string, desc: string) {
        return this.embed(
            user,
            'Red',
            title,
            desc 
        )
    }
    
    embedSuccess(user: Nullable<User>, title: Nullable<string>, desc: string) {
        return this.embed(
            user,
            'Green',
            title,
            desc 
        )
    }

    embed(user: Nullable<User>, color: ColorResolvable, title: Nullable<string>, desc: string, other?: Partial<APIEmbed>) {
        const embed = new EmbedBuilder(other)
        .setColor(Colors[color as keyof typeof Colors] ?? color)
        .setDescription(desc)
        .setTimestamp()
        .setTitle(title)

        if (user) {
            embed.setAuthor({
                iconURL: user.displayAvatarURL(),
                name: user.tag
            })
        }

        return embed 
    }
}