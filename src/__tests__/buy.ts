import { Message } from "discord.js"
import * as a from "./t"

((d: { keywords: Record<string, any>, data: { message: Message } }) => {
    const fns = require(process.cwd() + "/trabajos.js") as typeof a 
    const trabajos = require(process.cwd() + "/data.json").roles
    const trabajo = d.keywords.trabajo
    if (!trabajos.some((c: { name: string }) => c.name === trabajo.toLowerCase())) {
        return false
    }
    const next = fns.getNextTier(d.data.message.member!, trabajo)
    const current = fns.getCurrentTier(d.data.message.member!, trabajo)
    d.keywords.hasNext = !!next + ""
    const money = Number(d.keywords.money)
    if (next) {
        d.keywords.canAfford = (money > next.precio) + ""
        d.keywords.newRole = next.id 
        d.keywords.newMoney = (money - next.precio).toString()
    }

    d.keywords.oldRole = current?.id ?? ''
    d.keywords.nextTier = next
    d.keywords.tier = current
    return true
})