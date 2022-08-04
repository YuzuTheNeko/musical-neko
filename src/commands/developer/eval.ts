import { inspect } from "util";
import { Command } from "../../structures/Command";
import { ArgType } from "../../typings/enums/ArgType";

export default new Command({
    name: 'eval',
    description: 'evals a code',
    args: [
        {
            name: 'code',
            required: true,
            type: ArgType.String,
            description: "The code to evaluate"
        },
        {
            name: 'depth',
            required: false,
            description: 'The depth of the object',
            type: ArgType.Number,
            default: () => 0
        }
    ],
    execute: async function(interaction, [ code, depth ]) {
        await interaction.deferReply()

        let val;

        try {
            val = await eval(code)    
        } catch (error: any) {
            val = error.stack 
        }

        if (typeof val === 'object') val = inspect(val, { depth })

        await interaction.editReply({
            content: `\`\`\`js\n${val}\`\`\``
        })
    }
})