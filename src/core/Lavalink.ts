import { CoffeeLava, CoffeePlayer, CoffeeTrack, LavaEvents, UnresolvedTrack } from "lavacoffee";
import { LavaOptions } from "lavacoffee/dist/utils/typings";
import { NekoClient } from "./NekoClient";
import config from "../config.json"
import { Collection, GatewayDispatchEvents, User } from "discord.js";
import log from "../functions/log";
import { VoiceGuild } from "../structures/VoiceGuild";
import noop from "../functions/noop";
import { SkipFirstParameter } from "../typings/types/SkipParameters";
import { Nullable } from "../typings/types/Nullable";
import { SearchQuery } from "lavacoffee/dist/utils";

export class Lavalink {
    // This class is not extended due to a strange bug in the library 
    // That reassigns this class to the one extending it.
    private readonly server: CoffeeLava
    readonly guilds = new Collection<string, VoiceGuild>()

    constructor(private readonly client: NekoClient) {
        this.server = new CoffeeLava(Lavalink.createOptions(client))

        for (const node of config.lavalink.nodes) {
            this.server.add({
                url: `${node.ip}:${node.port}`,
                secure: false,
                ...node 
            })
        }
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

    private static createOptions(client: NekoClient): LavaOptions {
        return {
            defaultSearchPlatform: "yt",
            clientName: "neko",
            autoPlay: false,
            autoResume: true,
            send: (guildID, voice) => client.ws.shards.get(client.guilds.cache.get(guildID)!.shardId)!.send(voice)
        }
    }

    search(user: Nullable<User>, query: SearchQuery) {
        if (!this.isAnyNodeAvailable()) return null 
        return this.server.search(query, user).catch(() => null)
    }

    private onNodeConnect(...params: Parameters<LavaEvents["nodeConnect"]>) {
        const [ node ] = params
        this.log(`Node ${node.name} is ready!`)
    }

    private onNodeDisconnect(...params: Parameters<LavaEvents["nodeDisconnect"]>) {
        const [ node, { reason, code } ] = params
        this.log(`Node ${node.name} has disconnected, reason: ${reason}, code ${code}`)
    }

    private onNodeError(...params: Parameters<LavaEvents["nodeError"]>) {
        const [ node, error ] = params
        this.log(`Node ${node.name} has thrown an error: ${error.message}\nStack: ${error.stack}`)
    }

    public start(): void {
        this.server.on("nodeConnect", this.onNodeConnect.bind(this))
        this.server.on("nodeDisconnect", this.onNodeDisconnect.bind(this))
        this.server.on("nodeError", this.onNodeError.bind(this))
        
        this.server.on("trackStart", this.onTrackStart.bind(this))
        this.server.on("trackEnd", this.onTrackEnd.bind(this))
        this.server.on("trackError", this.onTrackError.bind(this))
        this.server.on("trackStuck", this.onTrackStuck.bind(this))

        this.client.on("raw", d => this.server.updateVoiceData(d))

        this.server.init(this.client.user!.id)    
    }

    private onTrackStart(...params: Parameters<LavaEvents["trackStart"]>) {
        const [ player  ] = params
        
        const voice = this.#checkVoice(player)

        if (!voice) return;

        voice["onTrackStart"](...params)
    }

    #checkVoice(player: CoffeePlayer): false | VoiceGuild {
        const voice = this.guild(player.guildID)
        if (!voice) {
            player.destroy()
            this.log(`No voice structure for guild ${player.guildID} found, player destroyed.`)
            return false;
        } 

        return voice
    }

    private onTrackEnd(...params: Parameters<LavaEvents["trackEnd"]>) {
        const [ player  ] = params
        
        const voice = this.#checkVoice(player)

        if (!voice) return;

        voice["onTrackEnd"](...params)
    }

    isAnyNodeAvailable() {
        return config.lavalink.nodes.some(c => this.server.nodes.get(c.name)!.connected)
    }

    private onTrackStuck(...params: Parameters<LavaEvents["trackStuck"]>) {
        const [ player  ] = params
        
        const voice = this.#checkVoice(player)

        if (!voice) return;

        voice["onTrackStuck"](...params)
    }

    private onTrackError(...params: Parameters<LavaEvents["trackError"]>) {
        const [ player  ] = params
        
        const voice = this.#checkVoice(player)

        if (!voice) return;

        voice["onTrackError"](...params)
    }

    log(...args: unknown[]) {
        return log('LAVALINK', ...args)
    }
}