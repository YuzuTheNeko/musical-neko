import noop from "../../functions/noop";
import { Command } from "../../structures/Command";

export default new Command({
    name: `stats`,
    description: `Shows bot stats`,
    execute: async function(m) {
        const embed = this.embedSuccess(
            this.user,
            `Bot Stats`,
            's'
        )

        embed.setDescription(null)

        const stats = this.manager.lavalink.stats

        embed.addFields([
            {
                name: `Memory Usage (Bot)`,
                inline: true, 
                value: Object.entries(process.memoryUsage()).map(c => `${c[0]}: ${(c[1] / (1024 ** 2)).toFixed(2)}MB`).join('\n')
            },
            {
                name: `Uptime`,
                value: this.manager.parser.parseToString(this.uptime, {
                    and: true,
                    limit: 2 
                }) || '0 seconds',
                inline: true 
            },
            {
                name: `Players`,
                value: stats.toLocaleString(),
                inline: true 
            },
            {
                name: `Uptime (Lavalink)`,
                value: this.manager.parser.parseToString(stats.uptime, {
                    and: true,
                    limit: 2 
                }) || '0 seconds',
                inline: true 
            },
            {
                name: `CPU Usage (Lavalink)`,
                inline: true,
                value: `Cores: ${stats.cpu.cores}\nLavalink Load: ${(stats.cpu.lavalinkLoad * 100).toFixed(2)}%\nSystem Load: ${(stats.cpu.systemLoad * 100).toFixed(2)}%`
            },
            {
                name: `Memory Usage (Lavalink)`,
                inline: true,
                value: Object.entries(stats.memory).map(
                    c => `${c[0]}: ${(c[1] / (1024 ** 2)).toFixed(2)}MB`
                ).join('\n')
            }
        ])

        m.channel.send({
            embeds: [
                embed
            ]
        })
        .catch(noop)
    }
})