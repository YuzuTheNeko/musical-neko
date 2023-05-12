import { NekoClient } from "./NekoClient";
import config from "../config.json"
import { Collection, User } from "discord.js";
import log from "../functions/log";
import { VoiceGuild } from "../structures/VoiceGuild";
import noop from "../functions/noop";
import { SkipFirstParameter } from "../typings/types/SkipParameters";
import { Nullable } from "../typings/types/Nullable";
import { MoonlinkEvents, MoonlinkManager, MoonlinkNode, MoonlinkPlayer, NodeStats, Nodes, SearchQuery } from "moonlink.js";

export class Lavalink {
    // This class is not extended due to a strange bug in the library 
    // That reassigns this class to the one extending it.
    private readonly server: MoonlinkManager
    readonly guilds = new Collection<string, VoiceGuild>()

    constructor(private readonly client: NekoClient) {
        this.server = new MoonlinkManager(config.lavalink.nodes.map(
            node => ({
                host: node.ip,
                secure: false,
                ...node 
            })
        ), {
            spotify: {},
            plugins: []
        }, (guildID: string, voice: any) => {
            return client.ws.shards.get(client.guilds.cache.get(guildID)!.shardId)!.send(JSON.parse(voice))
        })
    }

    add(...params: SkipFirstParameter<ConstructorParameters<typeof VoiceGuild>>) {
        const existing = this.guild(params[0])
        if (existing) return existing

        const guild = new VoiceGuild(this.client, ...params)
        this.guilds.set(guild.guildID, guild)
        return guild
    }

    guild(guildID: string) {
        return this.guilds.get(guildID)
    }

    get stats() {
        return this.server.leastUsedNodes!.stats as NodeStats
    }

    async search(user: User, query: SearchQuery) { 
        const t = await this.server.search(query).catch(() => null)
            t?.tracks.map(c => c.setRequester(user.id))
        return t 
    }

    private onNodeConnect(...params: Parameters<MoonlinkEvents["nodeCreate"]>) {
        const [ node ] = params
        this.log(`Node ${node.identifier} is ready!`)
    }

    private onNodeDisconnect(...params: Parameters<MoonlinkEvents["nodeClose"]>) {
        const [ node, code, reason ] = params
        this.log(`Node ${node.identifier} has disconnected, reason: ${reason}, code ${code}`)
    }

    private onNodeError(...params: Parameters<MoonlinkEvents["nodeError"]>) {
        const [ node, error ] = params
        this.log(`Node ${node.identifier} has thrown an error: ${error.message}\nStack: ${error.stack}`)
    }

    public start(): void {
        this.server.on("nodeCreate", this.onNodeConnect.bind(this))
        this.server.on("nodeClose", this.onNodeDisconnect.bind(this))
        this.server.on("nodeError", this.onNodeError.bind(this))
        
        this.server.on("trackStart", this.onTrackStart.bind(this))
        this.server.on("trackEnd", this.onTrackEnd.bind(this))
        this.server.on("trackError", this.onTrackError.bind(this))
        this.server.on("trackStuck", this.onTrackStuck.bind(this))

        this.client.on("raw", d => void this.server.packetUpdate(d))

        this.server.init(this.client.user!.id)    
    }

    private onTrackStart(...params: Parameters<MoonlinkEvents["trackStart"]>) {
        const [ player  ] = params
        
        const voice = this.#checkVoice(player)

        if (!voice) return;

        voice["onTrackStart"](...params)
    }

    #checkVoice(player: MoonlinkPlayer): false | VoiceGuild {
        const voice = this.guild(player.guildId)
        if (!voice) {
            player.destroy()
            this.log(`No voice structure for guild ${player.guildId} found, player destroyed.`)
            return false;
        } 

        return voice
    }

    private onTrackEnd(...params: Parameters<MoonlinkEvents["trackEnd"]>) {
        const [ player  ] = params
        
        const voice = this.#checkVoice(player)

        if (!voice) return;

        voice["onTrackEnd"](...params)
    }

    private onTrackStuck(...params: Parameters<MoonlinkEvents["trackStuck"]>) {
        const [ player  ] = params
        
        const voice = this.#checkVoice(player)

        if (!voice) return;

        voice["onTrackStuck"](...params)
    }

    private onTrackError(...params: Parameters<MoonlinkEvents["trackError"]>) {
        const [ player  ] = params
        
        const voice = this.#checkVoice(player)

        if (!voice) return;

        voice["onTrackError"](...params)
    }

    log(...args: unknown[]) {
        return log('LAVALINK', ...args)
    }
}