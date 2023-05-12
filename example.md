module.exports=({
    type: "basicCommand",
    name: "shop2",
    code: `
    
$color[1;BLUE]
$title[1;Tienda De Roles!]
$djsEval[no;
    const config = require(process.cwd() + "/data.json")
    const fns = require(process.cwd() + "/trabajos.js")
    const emote = config.emojis.coin

    // Cogemos referencia de embed
    const embed = d.container.embeds[0\\]

    const arr = new Array()

    // Haremos una loop sencilla.
    for (let i = 0, len = config.roles.length;i < len;i++) {
        const rol = config.roles[i\\]
        // Cogemos current tier
        const current = fns.getCurrentTier(d.data.message.member, rol.name)

        // Cogemos el next tier
        
        const nextTier = fns.getNextTier(d.data.message.member, rol.name)
        
        const role = d.data.message.guild.roles.cache.get(nextTier?.id)

        const main = role ? rol.name[0].toUpperCase() + rol.name.slice(1) + " • " + (nextTier ? emote + " \`" + nextTier.precio.toLocaleString() + "\` monedas" : "Imposible") : null 
        const value = main ? "**" + main + "**\\ncon el rol " + role + " " + rol.desc + " bajará a " + nextTier.cooldown : rol.name[0].toUpperCase() + rol.name.slice(1) + " ya esta al nivel máximo"

        arr.push(value)
    }

    embed.setDescription(arr.join("\\n\\n"))
]
    `
})