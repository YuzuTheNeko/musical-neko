import { ActionRowBuilder, APIEmbedField, ButtonBuilder, ButtonInteraction, ButtonStyle, Collection, ColorResolvable, Colors, ComponentType, EmbedBuilder, Guild, GuildMember, Message, MessageOptions, PermissionFlagsBits, StageChannel, TextBasedChannel, TextChannel, User, VoiceChannel } from "discord.js";
import { CoffeeLava, CoffeeTrack, LavaEvents } from "lavacoffee";
import { FilterUtils, LoadTypes, SearchQuery, SearchResult } from "lavacoffee/dist/utils";
import { runInThisContext } from "vm";
import { BOT_DISCONNECT, IDLE_TIMEOUT, MAX_VOLUME, MIN_VOLUME, TRACK_BACKWARD, TRACK_ERROR, TRACK_FAVORITE, TRACK_FIRST, TRACK_FORWARD, TRACK_LAST, TRACK_PAUSE, TRACK_REPLAY, TRACK_SKIP, TRACK_VOLUME } from "../constants";
import { Lavalink } from "../core/Lavalink";
import { NekoClient } from "../core/NekoClient";
import getTrackLyrics from "../functions/getTrackLyrics";
import log from "../functions/log";
import noop from "../functions/noop";
import removeBackticks from "../functions/removeBackticks";
import { toPluralAmount } from "../functions/toPlural";
import { CountType } from "../typings/enums/CountType";
import { LoopState } from "../typings/enums/LoopState";
import { PlayerState } from "../typings/enums/PlayerState";
import { TrackEndReasons } from "../typings/enums/TrackEndReasons";
import { Nullable } from "../typings/types/Nullable";
import { SkipFirstParameter } from "../typings/types/SkipParameters";
import { InteractionResolvable } from "./Command";

/**
 * Handles nearly all data for a lavalink voice guild.
 */
export class VoiceGuild {
    volume = 100
    filters = new FilterUtils({})
    
    channelID?: string
    voiceID?: string
    
    status = PlayerState.Idle
    loop = LoopState.None

    lastMessage?: Message

    position = 0

    idleTimeout: Nullable<NodeJS.Timeout> = null 

    readonly queue = new Array<CoffeeTrack>()
    readonly counters = new Collection<CountType, string[]>()

    reason: Nullable<TrackEndReasons> = null 

    '24/7' = false 

    constructor(readonly client: NekoClient, readonly guildID: string, properties: Partial<VoiceGuild> = {}) {
        const keys = Object.keys(properties) as Array<keyof VoiceGuild>
        for (let i = 0, len = keys.length;i < len;i++) {
            const key = keys[i]
            const value = properties[key]
            if (value === undefined) continue
            this[key as '24/7'] = value as boolean 
        }
    }

    get guild() {
        return this.client.guilds.cache.get(this.guildID)
    }

    is247() {
        return this["24/7"]
    }

    tryPlay() {
        const player = this.player
        
        if (!this.isIdle() || !player) return false 
        return this.forcePlay()
    }

    counter(type: CountType) {
        return this.counters.ensure(type, () => [])
    }

    get skipCounter() {
        return this.counter(CountType.Skip)
    }

    search(...params: Parameters<Lavalink["search"]>) {
        return this.lavalink.search(...params)
    }

    private onQueueEnd() {
        if (!this.is247()) {
            // We destroy the connection after X of inactivity.
            if (!this.idleTimeout) {
                this.idleTimeout = setTimeout(this.onIdleTimeout.bind(this), IDLE_TIMEOUT);
            } else {
                // We refresh the timeout if it already exists
                this.idleTimeout.refresh()
            }
        }
    }

    getTrackLyrics(...params: SkipFirstParameter<Parameters<typeof getTrackLyrics>>) {
        return getTrackLyrics(this.client, ...params)
    }

    setLoop(state: LoopState) {
        if (this.loop === state) return false
        this.loop = state
        return this 
    }

    get loopString() {
        return LoopState[this.loop] as keyof typeof LoopState
    }

    get stateString() {
        return PlayerState[this.status] as keyof typeof PlayerState
    }

    private cleanup() {
        if (this.idleTimeout) {
            clearTimeout(this.idleTimeout)
            this.idleTimeout = null 
        }
    }

    static orDefault(guild: Guild) {
        const client = guild.client as NekoClient
        return client.manager.lavalink.add(guild.id)
    }

    forcePlay(): boolean {
        const player = this.player

        if (!player) return false;

        const track = this.getCurrentTrack()

        if (!track) return false;

        player.queue.add(track)
        player.play()
        
        return true 
    }

    getTrackRequester(track: CoffeeTrack): Nullable<User> {
        return track.requester as User
    }

    setVoice(channel: Nullable<VoiceChannel | StageChannel>) {        
        const old = this.voiceID
        this.voiceID = channel?.id
        const player = this.createPlayer(this.voiceID)
        if (!player) return null 

        // Voice channel is null, destroy
        if (this.voiceID === undefined) {
            this.destroy()
        } else if (old !== this.voiceID) {
            // Voice channel changed
            player.voiceID = this.voiceID
            player.connect()
        } else {
            // Only connect is voice is not connected.
            if (!player.voiceConnected) {
                player.connect()
            }
        }

        return this 
    }

    getCurrentTrack(): CoffeeTrack | undefined {
        return this.queue[this.position]
    }

    getNextTrack(): CoffeeTrack | undefined {
        return this.queue[this.position + 1]
    }

    getLastTrack(): CoffeeTrack | undefined {
        return this.queue[this.position - 1]
    }

    async send(embed: EmbedBuilder, components: ActionRowBuilder[] = []): Promise<Nullable<Message>> {
        this.lastMessage?.delete().catch(noop)
        
        const msg = await this.channel?.send({
            embeds: [
                embed
            ],
            components: components as MessageOptions["components"]
        })
        .catch(noop)

        if (!msg) return null 

        this.lastMessage = msg 

        return msg 
    }

    get node() {
        return this.player?.node
    }

    private async onIdleTimeout() {
        await this.deleteMessage()
        this.send(
            this.embed(
                null,
                'Yellow',
                `Inactivity Timeout`,
                `I left the voice channel because I was inactive for too long`
            )
        )
        this.destroy()
    }

    private onCounterUpdate(type: CountType, counter: string[]) {
        switch (type) {
            case CountType.Skip: {
                if (counter.length >= this.requiredVotes) {
                    this.forceSkip()
                } else if (this.lastMessage) {
                    const embed = new EmbedBuilder({ ...this.lastMessage.embeds[0].data })
                    embed.addFields(this.skipField)

                    this.lastMessage.edit({
                        embeds: [
                            embed 
                        ]
                    })
                    .catch(noop)
                }
                break
            }
        }
    }

    get skipField(): APIEmbedField {
        return {
            name: `Skip Votes`,
            value: `${this.skipCounter.length} / ${this.requiredVotes} people have agreed to skip this track.`
        }
    }

    enqueue(result: Nullable<SearchResult>): Nullable<string> {
        if (!result || !result.tracks.length) return null 

        const queue = this.queue

        if (!queue) return null 

        // Some activity was made, ensure idle timeout is cleared.
        this.cleanup()

        if (result.loadType === LoadTypes.PlaylistLoaded) {
            queue.push(...result.tracks)
            return `${result.playlist!.name} (${toPluralAmount('track', result.tracks.length)})`
        } else if (result.loadType === LoadTypes.SearchResult || result.loadType === LoadTypes.TrackLoaded) {
            queue.push(result.tracks[0])
            return result.tracks[0].title
        }

        return null 
    }

    get player() {
        return this.lavalink["server"].get(this.guildID)
    }

    get voice() {
        return this.guild?.channels.cache.get(this.voiceID!) as VoiceChannel | StageChannel | undefined
    }

    get channel() {
        return this.guild?.channels.cache.get(this.channelID!) as TextChannel | undefined
    }

    setChannel(ch: Nullable<TextBasedChannel>) {
        this.channelID = ch?.id
        return this 
    }

    createPlayer(voiceID?: string) {
        const existing = this.player
        if (existing) return existing

        if (!this.lavalink.isAnyNodeAvailable()) return null 
        
        return this.lavalink["server"].create({
            guildID: this.guildID,
            node: this.lavalink["server"].leastLoadNode!.name,
            volume: this.volume,
            selfDeaf: true,
            selfMute: false,
            voiceID
        })
    }

    get lavalink() {
        return this.client.manager.lavalink
    }

    embed(...params: Parameters<NekoClient["embed"]>) {
        return this.client.embed(...params)
    }
    
    destroy() {
        this.player?.destroy()
        this.client.manager.lavalink.guilds.delete(this.guildID)
    }

    setVolume(vol: number) {
        if (isNaN(vol) || !Number.isInteger(vol) || vol < MIN_VOLUME || vol > MAX_VOLUME) return false 
        this.volume = vol
        this.player?.setVolume(vol)
        return this 
    }

    editFilters(edit: (f: FilterUtils) => FilterUtils) {
        this.filters = edit(this.filters)
        if (this.player) {
            this.player.filters = this.filters.build()
            this.player.patchFilters()
        }
        return this 
    }

    async deleteMessage() {
        await this.lastMessage?.delete().catch(noop)
        this.lastMessage = undefined
    }

    forceSkip(): boolean {
        if (this.isIdle()) return false
        this.stop(TrackEndReasons.Skipped)
        return true 
    }

    setPosition(i: number): boolean {
        if (!this.player) return false
        const trackAt = this.queue[i]
        if (!trackAt) return false 

        this.position = i
        this.stop(TrackEndReasons.Repositioned) 
        return true 
    }

    manageableBy(member: GuildMember, track = this.getCurrentTrack(), i?: InteractionResolvable) 
    {
        const bool = track && (member.permissions.has(PermissionFlagsBits.Administrator) || this.getTrackRequester(track)?.id === member.id)
        if (!bool && i) {
            i.reply({
                ephemeral: true,
                embeds: [
                    this.client.embedError(
                        i.user,
                        `Permission Error`,
                        `Only the person who requested this track can do this!`
                    )
                ]
            })
            .catch(noop)
        }

        return bool  
    }

    get requiredVotes(): number {
        const vc = this.voice
        if (!vc) return 1
        const size = vc.members.filter(c => !c.user.bot).size
        return size 
    }

    hasMessage() {
        return !!this.lastMessage
    }

    seek(ms: number) {
        const player = this.player
        if (!player) return false

        const track = this.getCurrentTrack()

        if (!track || !track.isSeekable || ms < 0 || track.duration < ms) return false

        player.seek(ms)
        return true 
    }

    inVoice() {
        return !!this.voiceID
    }

    static create(...params: ConstructorParameters<typeof VoiceGuild>) {
        return new this(...params)
    }

    pause() {
        if (!this.isPlaying()) return false
        this.player?.pause(true)
        this.status = PlayerState.Paused
        return true 
    }

    resume() {
        if (this.isPlaying()) return false
        this.player?.pause(false)
        this.status = PlayerState.Playing
        return true 
    }

    isPlaying() {
        return this.status === PlayerState.Playing
    }

    isPaused() {
        return this.status === PlayerState.Paused
    }

    isIdle() {
        return this.status === PlayerState.Idle
    }

    stop(reason: TrackEndReasons) {
        this.reason = reason 
        return this.player?.stop()
    }

    private async onTrackStart(...params: Parameters<LavaEvents["trackStart"]>) {
        this.status = PlayerState.Playing
        const [ player, track ] = params
        if (!CoffeeTrack.isTrack(track)) {
            this.log(`An unresolved track was found, aborted.`)
            return 
        }

        if (!this.inVoice()) {
            this.log(`Player for guild ${player.guildID} has been destroyed, there was no voice channel.`)
            this.destroy()
            return 
        }

        const ch = this.channel
        if (ch) {
            const thumbnail = track.displayThumbnail('default')

            const rows = new Array<ActionRowBuilder<ButtonBuilder>>(
                new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder({
                        emoji: {
                            name:'⏪'
                        },
                        style: ButtonStyle.Primary,
                        custom_id: TRACK_FIRST,
                        type: ComponentType.Button
                    }), 
                    new ButtonBuilder({
                        emoji: {
                            name:'◀️'
                        },
                        style: ButtonStyle.Primary,
                        custom_id: TRACK_BACKWARD,
                        type: ComponentType.Button
                    }),
                    new ButtonBuilder({
                        emoji: {
                            name:'⏸️'
                        },
                        style: ButtonStyle.Success,
                        custom_id: TRACK_PAUSE,
                        type: ComponentType.Button
                    }),
                    new ButtonBuilder({
                        emoji: {
                            name:'▶️'
                        },
                        style: ButtonStyle.Primary,
                        custom_id: TRACK_FORWARD,
                        type: ComponentType.Button
                    }),
                    new ButtonBuilder({
                        emoji: {
                            name:'⏩'
                        },
                        style: ButtonStyle.Primary,
                        custom_id: TRACK_LAST,
                        type: ComponentType.Button
                    })
                ),
                new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder({
                        label: '🚪',
                        style: ButtonStyle.Danger,
                        custom_id: BOT_DISCONNECT,
                        type: ComponentType.Button
                    }),
                    new ButtonBuilder({
                        emoji: {
                            name:'🔊'
                        },
                        style: ButtonStyle.Success,
                        custom_id: TRACK_VOLUME,
                        type: ComponentType.Button
                    }),
                    new ButtonBuilder({
                        emoji: {
                            name: '💟'
                        },
                        style: ButtonStyle.Danger,
                        custom_id: TRACK_FAVORITE,
                        type: ComponentType.Button
                    }),
                    new ButtonBuilder({
                        emoji: {
                            name:'🔁'
                        },
                        style: ButtonStyle.Success,
                        custom_id: TRACK_REPLAY,
                        type: ComponentType.Button
                    }),
                    new ButtonBuilder({
                        emoji: {
                            name: '⏭️'
                        }, 
                        style: ButtonStyle.Danger,
                        custom_id: TRACK_SKIP,
                        type: ComponentType.Button
                    }),
                )
            )

            await this.send(
                this.embed(
                    this.getTrackRequester(track)!, 
                    'Blue', 
                    'Track Start', 
                    `Playing now [${track.title}](${track.url})`,
                    {
                        thumbnail: thumbnail ? {
                            url: thumbnail
                        } : undefined
                    }, 
                ),
                rows 
            )
            .catch(noop)
        }
    }

    private onTrackError(...params: Parameters<LavaEvents["trackError"]>) {
        const [, track, { exception }] = params
        this.log(`There was an error while running track ${track.title} on guild ${this.guildID}: ${exception.message}, severity: ${exception.severity}`)

        this.advance()
        
        const next = this.getCurrentTrack()

        if (CoffeeTrack.isTrack(track)) {
            this.send(
                this.embed(
                    this.getTrackRequester(track)!,
                    'Red',
                    TRACK_ERROR,
                    `There was an error while attempting to play track \`${removeBackticks(track.title)}\`:\n\`\`\`\n${exception.message}\`\`\`\nThe next song will be played (if any)`
                )
            )
        }

        if (!next) {
            this.status = PlayerState.Idle
            return;
        }

        this.forcePlay()
    }

    private onTrackStuck(...params: Parameters<LavaEvents["trackStuck"]>) {
        const [ player, track ] = params
        
        if (CoffeeTrack.isTrack(track)) {
            this.send(
                this.embed(
                    this.getTrackRequester(track)!,
                    'Red',
                    TRACK_ERROR,
                    `Track \`${removeBackticks(track.title)}\` got stuck. The next song will be played (if any)`
                )
            )
        }

        this.forceSkip()
        this.log(`Track ${track.title} got stuck for guild ${this.guildID}, force skipped.`)
    }

    private async onTrackEnd(...params: Parameters<LavaEvents["trackEnd"]>) {
        this.counters.clear()
        this.advance()

        const next = this.getCurrentTrack()

        await this.deleteMessage()

        if (!next) {
            this.status = PlayerState.Idle
            return;
        }

        this.forcePlay()
    }

    private advance() {
        const reason = this.reason

        if (reason !== TrackEndReasons.Repositioned) {
            switch (this.loop) {
                case LoopState.None: {
                    this.position++
                    break
                }
    
                case LoopState.Song: {
                    break
                }
    
                case LoopState.Queue: {
                    this.position++
                    if (!this.getCurrentTrack()) {
                        this.position = 0
                    }
                }
            }
        }

        this.reason = null 

        if (!this.getCurrentTrack()) {
            this.onQueueEnd()
        }
    }

    log(...params: unknown[]) {
        log('VOICE GUILD', ...params)
    }

    *[Symbol.iterator]() {
        const items = this.queue.values()
        let it: ReturnType<typeof items["next"]>
        while (it = items.next()) {
            if (it.done) return;
            yield it.value
        }
    }

    get [Symbol.toStringTag]() {
        return this.constructor.name 
    }
}