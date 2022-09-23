import noop from "../../functions/noop";
import { Command } from "../../structures/Command";
import { ArgType } from "../../typings/enums/ArgType";
import { PlayerState } from "../../typings/enums/PlayerState";

export default new Command({
    name: `pitch`,
    description: `Sets pitch filter`,
    args: [
        {
            name: `amount`,
            min: 0.5,
            max: 2,
            float: true,
            required: false,
            default: () => 1,
            description: `The amount of pitchness`,
            type: ArgType.Number
        }
    ],
    music: {
        mustMatchVoice: true,
        userInVoice: true 
    },
    execute: async function(m, [ v ]) {
        const voice = this.manager.lavalink.guild(m.guildId)
        if (!voice) return;

        voice.editFilters(f => f.timescale.setPitch(v))
        m.channel.send({
            embeds: [
                this.embedSuccess(
                    m.author,
                    `Pitch Set`,
                    `Pitchness has been set to \`${v}\``
                )
            ]
        })   
        .catch(noop)
    }
})