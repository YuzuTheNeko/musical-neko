import { ArgParser, NumberFlagParser } from "arg-capturer";
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
        }
    ],
    flags: new ArgParser(false, {
        depth: new NumberFlagParser()
    }),
    execute: async function(m, [ code ], extras) {
        let val;

        try {
            val = await eval(code)    
        } catch (error: any) {
            val = error.stack 
        }

        if (typeof val === 'object') val = inspect(val, { depth: extras.flags.depth ?? 0 })

        await m.channel.send({
            content: `\`\`\`js\n${val}\`\`\``
        })
    }
})