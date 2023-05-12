import { GuildMember } from "discord.js";
import bro from "./bro.json"

const trabajos: typeof bro = require(process.cwd() + "/config.json").roles

function getTrabajos(member: GuildMember) {
    const arr = new Array<string>()
    for (let i = 0, len = trabajos.length;i < len;i++) {
        const trabajo = trabajos[i]
        if (trabajo.tiers.some(tier => member.roles.cache.has(tier.id))) {
            arr.push(trabajo.name)
        }
    }

    return arr 
}

function getCurrentTier(member: GuildMember, trabajo: string) {
    const data = trabajos.find(c => c.name === trabajo)!
    for (let i = 0, len = data.tiers.length;i < len;i++) {
        const tier = data.tiers[i]
        if (member.roles.cache.has(tier.id)) return {
            ...tier,
            level: i + 1
        } 
    }
    return null 
}

function getCurrentTiers(member: GuildMember)  {
    const arr = new Array<(typeof trabajos[number]["tiers"][number] & { level: number })>()
    for (let i = 0, len = trabajos.length;i < len;i++) {
        const trbj = trabajos[i]
        const tier = getCurrentTier(member, trbj.name)
        if (!tier) continue
        arr.push(tier)
    }
    return arr 
}

function getNextTier(member: GuildMember, trabajo: string) {
    const data = trabajos.find(c => c.name === trabajo)!
    const tier = getCurrentTier(member, trabajo)
    return tier === null ? data.tiers[0] : data.tiers[tier.level] ?? null
}

function getCooldown(member: GuildMember, trabajo: string): string {
    const data = trabajos.find(c => c.name === trabajo)!
    const tier = getCurrentTier(member, trabajo)
    return tier?.cooldown ?? data.cooldown
}

function getNextTiers(member: GuildMember) {
    const arr = new Array<ReturnType<typeof getNextTier>>()
    for (let i = 0, len = trabajos.length;i < len;i++) {
        const t = trabajos[i]
        const tier = getNextTier(member, t.name)
        if (!tier) continue
        arr.push(tier)
    }
    return arr 
}

export {
    getNextTier,
    getCurrentTier,
    getCooldown,
    getTrabajos,
    getNextTiers,
    getCurrentTiers
}