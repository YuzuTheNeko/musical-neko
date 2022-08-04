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
    execute: async function(i, [ pos ]) {
        let position: number

        try {
            const rawPos = Number(pos)

            // We shouldn't be doing this, however a lot of dumb people exist within Discord.
            position = isNaN(rawPos) ? this.manager.parser.unsafeParseToMS(pos) : rawPos
        } catch (error) {
            return void i.reply({
                ephemeral: true,
                embeds: [
                    this.embedError(
                        i.user,
                        'Invalid Position',
                        `Given position (\`${removeBackticks(pos)}\`) is not valid`
                    )
                ]
            }).catch(noop)
        }

        const voice = this.manager.lavalink.guild(i.guildId)
        if (!voice) return;

        i.reply({
            embeds: [
                voice.seek(position) ? 
                this.embedSuccess(
                    i.user,
                    'Seek Success',
                    `Successfully seeked to given position`
                ) : 
                this.embedError(
                    i.user,
                    `Seek Failed`,
                    `Failed to seek to given position`
                )
            ]
        })
        .catch(noop)
    }
})