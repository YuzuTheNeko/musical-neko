import { LoadTypes, SearchPlatform } from "lavacoffee/dist/utils";
import noop from "../../functions/noop";
import removeBackticks from "../../functions/removeBackticks";
import { Command } from "../../structures/Command";
import { VoiceGuild } from "../../structures/VoiceGuild";
import { ArgType } from "../../typings/enums/ArgType";
import { SourceType } from "../../typings/enums/SourceType";

export default new Command({
    name: `play`,
    description: "Plays a command from a given url or search",
    args: [
        {
            name: `song`,
            description: `Song url or query`,
            type: ArgType.String,
            autocomplete: true,
            required: true
        },
        {
            name: 'source',
            type: ArgType.Enum,
            required: false,
            enum: SourceType,
            enumValues: 'string',
            description: 'The source to use for this search, do not use if you will use an url',
            default: () => SourceType.Youtube
        }
    ],
    music: {
        userInVoice: true,
        mustMatchVoice: true 
    },
    execute: async function(i, [ query, source ]) {
        await i.deferReply()
            .catch(noop)
        
        const voice = VoiceGuild.orDefault(i.guild)
            .setChannel(i.channel)
            .setVoice(i.member.voice.channel!)

        if (!voice) {
            return void i.editReply({
                embeds: [
                    this.embedError(
                        i.user,
                        `Node Error`,
                        `A player for this guild could not be created, please try again later!`
                    )
                ]
            }).catch(noop)
        }

        const found = await voice.search(i.user, {
            query,
            source: source as SearchPlatform
        })

        const title = voice.enqueue(found)

        if (title === null) {
            i.editReply({
                embeds: [
                    this.embedError(
                        i.user,
                        `Load Error`,
                        `Could not find any song with given query: \`${query}\``
                    )
                ]
            })
                .catch(noop)
            return;
        }

        voice.tryPlay()

        i.editReply({
            embeds: [
                this.embedSuccess(
                    i.user,
                    found?.loadType === LoadTypes.PlaylistLoaded ? `Playlist Added` : `Track Added`,
                    `Successfully added \`${removeBackticks(title)}\` to the queue`
                )
            ]
        })
            .catch(noop)
    }
})