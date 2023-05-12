import { ArgParser, BooleanFlagParser, StringFlagParser } from "arg-capturer";
import noop from "../../functions/noop";
import removeBackticks from "../../functions/removeBackticks";
import { Command } from "../../structures/Command";
import { VoiceGuild } from "../../structures/VoiceGuild";
import { ArgType } from "../../typings/enums/ArgType";
import { SourceType } from "../../typings/enums/SourceType";

export default new Command({
    name: `play`,
    aliases: [
        "p"
    ],
    description: "Plays a command from a given url or search",
    args: [
        {
            name: `song`,
            description: `Song url or query`,
            type: ArgType.String,
            autocomplete: true,
            required: true
        },
    ],
    flags: new ArgParser(false, {
        source: new StringFlagParser(),
        first: new BooleanFlagParser()
    }),
    music: {
        userInVoice: true,
        mustMatchVoice: true 
    },
    execute: async function(m, [ query ], extras) {        
        const voice = VoiceGuild.orDefault(m.guild)
            .setChannel(m.channel)
            .setVoice(m.member?.voice.channel!)

        if (!voice) {
            return void m.channel.send({
                embeds: [
                    this.embedError(
                        m.author,
                        `Node Error`,
                        `A player for this guild could not be created, please try again later!`
                    )
                ]
            }).catch(noop)
        }

        const found = await voice.search(m.author, {
            query,
            source: extras.flags.source ?? 'ytsearch'
        })

        const title = await voice.enqueue(found, m, extras.flags.first)

        if (title === undefined) {
            return;
        }
        
        if (title === null) {
            return void m.channel.send({
                embeds: [
                    this.embedError(
                        m.author,
                        `Load Error`,
                        `Could not find any song with given query: \`${query}\``
                    )
                ]
            })
            .catch(noop)
        }

        await voice.tryPlay()

        m.channel.send({
            embeds: [
                this.embedSuccess(
                    m.author,
                    found?.loadType === 'PLAYLIST_LOADED' ? `Playlist Added` : `Track Added`,
                    `Successfully added \`${removeBackticks(title)}\` to the queue`
                )
            ]
        })
        .catch(noop)
    }
})