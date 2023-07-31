import { ActionRowBuilder, APIEmbedField, ButtonBuilder, ButtonInteraction, ButtonStyle, Collection, ColorResolvable, Colors, ComponentType, EmbedBuilder, Guild, GuildMember, inlineCode, Message, PermissionFlagsBits, roleMention, SelectMenuBuilder, SelectMenuInteraction, StageChannel, StringSelectMenuBuilder, TextBasedChannel, TextChannel, User, VoiceChannel } from "discord.js";
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
import { RawSongData } from "../typings/interfaces/RawSongData";
import { Nullable } from "../typings/types/Nullable";
import { SkipFirstParameter } from "../typings/types/SkipParameters";
import { InteractionResolvable } from "./Command";
import { MoonlinkEvents, MoonlinkPlayer, MoonlinkTrack, SearchResult } from "moonlink.js";

/**
 * Handles nearly all data for a lavalink voice guild.
 */
export class VoiceGuild {
    volume = 100
    
    channelID?: string
    voiceID?: string
    
    status = PlayerState.Idle
    loop = LoopState.None

    lastMessage?: Message

    position = 0

    idleTimeout: Nullable<NodeJS.Timeout> = null 

    readonly queue = new Array<MoonlinkTrack | RawSongData>()
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

    toRawSongs(user: User): RawSongData[] {
        return this.queue.map(c => ({
            userID: user.id,
            title: c.title,
            url: c.url
        }))
    }

    clearFilters() {

    }

    get guild() {
        return this.client.guilds.cache.get(this.guildID)
    }

    is247() {
        return this["24/7"]
    }

    async tryPlay() {
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

    async forcePlay() {
        const player = this.player

        if (!player) return false;

        const track = await this.getCurrentTrack()

        if (!track) return false;

        player.queue.add(track)
        await player.play()
        
        return true 
    }

    async getTrackRequester(track: MoonlinkTrack) {
        return this.client.users.fetch(track.requester as string)
    }

    setVoice(channel: Nullable<VoiceChannel | StageChannel>) {        
        const old = this.voiceID
        this.voiceID = channel?.id
        const player = this.player
        if (!player) return null 

        // Voice channel is null, destroy
        if (this.voiceID === undefined) {
            this.destroy()
        } else if (old !== this.voiceID) {
            // Voice channel changed
            player.voiceChannel = this.voiceID
            player.connect({
                setDeaf: true
            })
        } else {
            // Only connect is voice is not connected.
            if (!player.connected) {
                player.connect({
                    setDeaf: true
                })
            }
        }

        return this 
    }

    getCurrentTrack() {
        return this.resolve(this.queue[this.position], this.position)
    }

    async getNextTrack() {
        const index = this.position + 1
        return this.resolve(this.queue[index], index)
    }

    async getLastTrack() {
        const index = this.position - 1
        return this.resolve(this.queue[index], index)
    }

    async send(embed: EmbedBuilder, components: ActionRowBuilder<any>[] = []): Promise<Nullable<Message>> {
        this.lastMessage?.delete().catch(noop)
        
        const msg = await this.channel?.send({
            embeds: [
                embed
            ],
            components
        })
        .catch(noop)

        if (!msg) return null 

        this.lastMessage = msg 

        return msg 
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

    async enqueue(result: Nullable<SearchResult>, m?: Message<true>, pickFirst = false): Promise<Nullable<undefined | string>> {
        if (!result || !result.tracks.length) return null 

        const queue = this.queue

        if (!queue) return null 

        // Some activity was made, ensure idle timeout is cleared.
        this.cleanup()

        if (result.loadType === 'PLAYLIST_LOADED') {
            queue.push(...result.tracks)
            return `${result.playlistInfo!.name} (${toPluralAmount('track', result.tracks.length)})`
        } else if (result.loadType === 'TRACK_LOADED' || (!m && result.loadType === 'SEARCH_RESULT')) {
            queue.push(result.tracks[0])
            return result.tracks[0].title
        } else if (result.loadType === 'SEARCH_RESULT' && m) {
            if (pickFirst) {
                const trk = result.tracks[0]
                queue.push(trk)
                return trk.title
            }
            
            const embed = this.client.embedSuccess(
                m.author,
                `Search Results`,
                result.tracks.slice(0, 10).map(
                    (x, y) => `**\`[${y + 1}]\`** - [${x.title}](${x.url})`
                ).join('\n')
            )

            embed.setFooter({
                text: `Pick one in the select menu.`
            })

            const id = `select_song_menu` as const 

            const msg = await m.channel.send({
                embeds: [
                    embed
                ],
                components: [
                    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                        new StringSelectMenuBuilder({
                            maxValues: 1,
                            minValues: 1,
                            customId: id,
                            options: result.tracks.slice(0, 10).map((x, y) => ({
                                label: x.title,
                                value: y.toString(),
                                description: `Song #${y + 1}`
                            }))
                        })
                    )
                ]
            })
            .catch(noop)

            if (!msg) return null 

            const answer = await msg.awaitMessageComponent(
                {
                    filter: i => {
                        return i.user.id === m.author.id && i.customId === id
                    },
                    time: 15_000
                }
            ).catch(noop)

            if (!answer) {
                msg.edit({
                    embeds: [
                        embed.setColor('Red')
                        .setDescription(`This selection has expired...`)
                    ],
                    components: []
                })
                .catch(noop)
                return undefined
            } 

            msg.delete()
            .catch(noop)
            
            const got = result.tracks[(answer as SelectMenuInteraction).values[0] as unknown as number]
            queue.push(got)
            return got.title
        }

        return null 
    }

    get player() {
        const existing = this.lavalink['server'].players.get(this.guildID)
        if (existing) return existing
        return this.lavalink["server"].players.create({
            autoPlay: false,
            guildId: this.guildID,
            textChannel: this.channelID!,
            voiceChannel: this.voiceID!
        })
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

    editFilters() {

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
        if (this.isIdle()) {
            this.tryPlay()
        } else {
            this.stop(TrackEndReasons.Repositioned) 
        }
        return true 
    }

    async resolve(track: undefined | VoiceGuild["queue"][number], index: number): Promise<MoonlinkTrack | undefined> {
        if (!track) return undefined
        if (track instanceof MoonlinkTrack) return track
        const user = await this.client.users.fetch(track.userID)
        const got = await this.lavalink.search(user, {
            query: track.url
        })
        const trk = got!.tracks[0]
        this.queue[index] = trk  
        return trk 
    }

    async manageableBy(member: GuildMember, track?: MoonlinkTrack, i?: InteractionResolvable | Message) 
    {
        track ??= await this.getCurrentTrack()
        const bool = !track || (track && (member.permissions.any(this.client.manager.permissions) || (await this.getTrackRequester(track))?.id === member.id) || member.roles.cache.some(r => this.client.config.bypassRoles.includes(r.id as typeof this.client.config.bypassRoles[number])))
        if (!bool && i) {
            const embeds = [
                this.client.embedError(
                    i instanceof Message ? i.author : i.user,
                    `Permission Error`,
                    `You are not allowed to do this, only ${track?.requester}${
                        this.client.manager.permissions.bitfield !== 0n ? 
                        `, a member with any of these permissions: ${this.client.manager.permissions.toArray().map(inlineCode).join(', ')}` :
                        ''
                    }${
                        this.client.config.bypassRoles.length ? 
                        `, a member with one of these roles: ${
                            this.client.config.bypassRoles.map(roleMention).join(', ')
                        }` :
                        ''
                    } can do this.`
                )
            ]

            if (i instanceof Message) {
                i.reply({
                    embeds 
                })
                .catch(noop)
            } else {
                i.channel?.send({
                    embeds 
                })
                .catch(noop)
            }
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

    async seek(ms: number) {
        const player = this.player
        if (!player) return false

        const track = await this.getCurrentTrack()

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
        this.player?.pause()
        this.status = PlayerState.Paused
        return true 
    }

    resume() {
        if (this.isPlaying()) return false
        this.player?.resume()
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

    shuffle() {
        for (let i = 0, len = this.queue.length;i < len;i++) {
            const track = this.queue[i]
            const rnd = Math.floor(Math.random() * this.queue.length)
            const other = this.queue[rnd]
            this.queue[i] = other
            this.queue[rnd] = track
        }
    }

    async vote(by: GuildMember) {
        const counter = this.skipCounter
        const trk = await this.getCurrentTrack()
        if ((trk?.requester as User).id === by.id || by.permissions.any(this.client.manager.permissions)) {
            this.forceSkip()
            return true
        }
        if (counter.includes(by.id)) return false
        counter.push(by.id)
        this.onCounterUpdate(CountType.Skip, counter)
        return true 
    }

    makeButtons() {
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

        return rows 
    }
    
    private async onTrackStart(...params: Parameters<MoonlinkEvents["trackStart"]>) {
        this.status = PlayerState.Playing
        this.cleanup()
        
        const [ player, track ] = params

        if (!this.inVoice()) {
            this.log(`Player for guild ${player.guildId} has been destroyed, there was no voice channel.`)
            this.destroy()
            return 
        }

        const ch = this.channel
        if (ch) {
            const thumbnail = track.thumbnail
            await this.send(
                this.embed(
                    await this.getTrackRequester(track)!, 
                    'Blue', 
                    'Track Start', 
                    `Playing now [${track.title}](${track.url})`,
                    {
                        thumbnail: thumbnail ? {
                            url: thumbnail
                        } : undefined
                    }, 
                ),
                this.makeButtons()
            )
            .catch(noop)
        }
    }

    private async onTrackError(...params: Parameters<MoonlinkEvents["trackError"]>) {
        const [, track ] = params
        
        this.log(`There was an error while running track ${track.title} on guild ${this.guildID}`)
        
        this.send(
            this.embed(
                await this.getTrackRequester(track)!,
                'Red',
                TRACK_ERROR,
                `There was an error while attempting to play track \`${removeBackticks(track.title)}\`\nThe next song will be played (if any)`
            )
        )

        if (this.loop === LoopState.Song) this.position++
        this.forceSkip()
    }

    private async onTrackStuck(...params: Parameters<MoonlinkEvents["trackStuck"]>) {
        const [ player, track ] = params
        
        this.send(
            this.embed(
                await this.getTrackRequester(track)!,
                'Red',
                TRACK_ERROR,
                `Track \`${removeBackticks(track.title)}\` got stuck. The next song will be played (if any)`
            )
        )

        this.forceSkip()
        this.log(`Track ${track.title} got stuck for guild ${this.guildID}, force skipped.`)
    }

    private async onTrackEnd(...params: Parameters<MoonlinkEvents["trackEnd"]>) {
        this.counters.clear()
        await this.advance()

        const next = await this.getCurrentTrack()

        await this.deleteMessage()

        if (!next) {
            this.status = PlayerState.Idle
            return;
        }

        this.forcePlay()
    }

    private async advance() {
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
                    if (!(await this.getCurrentTrack())) {
                        this.position = 0
                    }
                }
            }
        }

        this.reason = null 

        if (!(await this.getCurrentTrack())) {
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