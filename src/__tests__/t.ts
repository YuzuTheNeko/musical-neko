import { GuildMember } from "discord.js";

const trabajos = [
    {
        "name": "trabajador", 
        "tiers":[
            {
                name: 'trabajador_1',
                "id": "000000", 
                "precio": 5000
            },
            {
                name: 'trabajador_1',
                "id": "1111111", 
                "precio": 8000
            },
            {
                name: 'trabajador_1',
                "id": "22222", 
                "precio": 10000
            }
        ]
    },
    {
        "name": "asaltante", 
        "tiers": [
            {
                name: 'trabajador_1',
                "id": "000000", 
                "precio": 5000
            },
            {
                name: 'trabajador_1',
                "id": "1111111", 
                "precio": 8000
            },
            {
                name: 'trabajador_1',
                "id": "22222", 
                "precio": 10000
            }
        ]
    },
    {
        "name": "ludopata", 
        "tiers": [
            {
                name: 'trabajador_1',
                "id": "000000", 
                "precio": 5000
            },
            {
                name: 'trabajador_1',
                "id": "1111111", 
                "precio": 8000
            },
            {
                name: 'trabajador_1',
                "id": "22222", 
                "precio": 10000
            }
        ]
    }
]

function getTrabajo(member: GuildMember) {
    for (let i = 0, len = trabajos.length;i < len;i++) {
        const trabajo = trabajos[i]
        if (trabajo.tiers.some(tier => member.roles.cache.has(tier.id))) return trabajo.name
    }

    return null 
}

function getCurrentTier(member: GuildMember) {
    const trabajo = getTrabajo(member)
    if (!trabajo) return null 
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

function getNextTier(member: GuildMember) {
    const trabajo = getTrabajo(member)
    if (!trabajo) return null 

    const data = trabajos.find(c => c.name === trabajo)!
    const tier = getCurrentTier(member)
    if (!tier) return null 

    return tier === null ? data.tiers[0] : data.tiers[tier.level] ?? null
}

export {
    getNextTier,
    getCurrentTier,
    getTrabajo
}