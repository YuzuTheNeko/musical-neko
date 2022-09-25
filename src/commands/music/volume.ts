import { MAX_VOLUME, MIN_VOLUME } from "../../constants";
import noop from "../../functions/noop";
import removeBackticks from "../../functions/removeBackticks";
import { Command } from "../../structures/Command";
import { ArgType } from "../../typings/enums/ArgType";
import { PlayerState } from "../../typings/enums/PlayerState";

export default new Command({
    name: 'volume',
    aliases: [
        "v"
    ],
    args: [
        {
            name: `amount`,
            description: `The new volume`,
            type: ArgType.Number,
            required: true
        }
    ],
    description: 'Sets the volume for the songs',
    music: {
        mustMatchVoice: true,
        userInVoice: true 
    },
    execute: async function(m, [ n ]) {
        const voice = this.manager.lavalink.guild(m.guildId)
        if (!voice || !(await voice.manageableBy(m.member!, undefined, m))) return;

        if (!voice.setVolume(n)) {
            return void m.channel.send({
                embeds: [
                    this.embedError(
                        m.author,
                        `Volume Error`,
                        `Given volume must be in between ${MIN_VOLUME} and ${MAX_VOLUME} and be a valid number.`
                    )
                ]
            })
            .catch(noop)
        }

        m.channel.send({
            embeds: [
                this.embedSuccess(
                    m.author,
                    `Volume Changed`,
                    `Successfully set volume to \`${n}\`!`
                )
            ]
        })
        .catch(noop)
    }
})