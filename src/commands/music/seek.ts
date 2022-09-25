import noop from "../../functions/noop";
import removeBackticks from "../../functions/removeBackticks";
import { Command } from "../../structures/Command";
import { ArgType } from "../../typings/enums/ArgType";
import { PlayerState } from "../../typings/enums/PlayerState";

export default new Command({
    name: 'seek',
    description: 'Seeks the current song',
    args: [
        {
            autocomplete: true,
            description: `The position to seek to, if no choice is given it means the time could not be parsed correctly.`,
            name: `position`,
            type: ArgType.String,
            required: true
        }
    ],
    music: {
        mustMatchVoice: true,
        state: [ 
            PlayerState.Playing, 
            PlayerState.Paused 
        ],
        userInVoice: true 
    },
    execute: async function(m, [ pos ]) {
        let position: number

        try {
            const rawPos = Number(pos)

            // We shouldn't be doing this, however a lot of dumb people exist within Discord.
            position = isNaN(rawPos) ? this.manager.parser.unsafeParseToMS(pos) : rawPos
        } catch (error) {
            return void m.channel.send({
                embeds: [
                    this.embedError(
                        m.author,
                        'Invalid Position',
                        `Given position (\`${removeBackticks(pos)}\`) is not valid`
                    )
                ]
            }).catch(noop)
        }

        const voice = this.manager.lavalink.guild(m.guildId)
        if (!voice) return;

        m.channel.send({
            embeds: [
                await voice.seek(position) ? 
                this.embedSuccess(
                    m.author,
                    'Seek Success',
                    `Successfully seeked to given position`
                ) : 
                this.embedError(
                    m.author,
                    `Seek Failed`,
                    `Failed to seek to given position`
                )
            ]
        })
        .catch(noop)
    }
})