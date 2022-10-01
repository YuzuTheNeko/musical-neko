import { Message } from "discord.js"
import * as a from "./t"

((d: { keywords: Record<string, string>, data: { message: Message } }) => {
    const fns = require(process.cwd() + "/trabajos.js") as typeof a 
    const trabajo = fns.getTrabajo(d.data.message.member!)
    const next = fns.getNextTier(d.data.message.member!)
    const current = fns.getCurrentTier(d.data.message.member!)
    d.keywords.hasNext = `${!!next}`
    const money = Number(d.keywords.money)
    if (next) {
        d.keywords.canAfford = `${money > next.precio}` 
        d.keywords.newRole = next.id 
        d.keywords.newMoney = (money - next.precio).toString()
        d.keywords.nextRoleName = next.name
    }

    d.keywords.roleName = current?.name ?? ''
    d.keywords.trabajo = trabajo ?? ''
    d.keywords.oldRole = current?.id ?? ''
})