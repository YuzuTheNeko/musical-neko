import noop from "../../functions/noop";
import { Command } from "../../structures/Command";
import { ArgType } from "../../typings/enums/ArgType";
import { LoopState } from "../../typings/enums/LoopState";
import { PlayerState } from "../../typings/enums/PlayerState";

export default new Command({
    name: `loop`,
    description: `Sets loop type for this song`,
    args: [
        {
            name: `amount`,
            required: true,
            description: `The loop type`,
            type: ArgType.Enum,
            enum: LoopState
        }
    ],
    music: {
        state: [
            PlayerState.Paused,
            PlayerState.Playing
        ],
        mustMatchVoice: true,
        userInVoice: true 
    },
    execute: async function(m, [ v ]) {
        const voice = this.manager.lavalink.guild(m.guildId)
        if (!voice) return;

        if (voice.loop === v) return void m.channel.send({
            embeds: [
                this.embedSuccess(
                    m.author,
                    `State Failed`,
                    `The player is already set to \`${voice.loopString}\`!`
                )
            ]
        })
        .catch(noop)

        voice.setLoop(v)
        
        m.channel.send({
            embeds: [
                this.embedSuccess(
                    m.author,
                    `State Set`,
                    `Set loop state to \`${voice.loopString}\``
                )
            ]
        })   
        .catch(noop)
    }
})