import { disableValidators, GatewayIntentBits, Partials } from "discord.js";
import { NekoClient } from "./core/NekoClient";

const client = new NekoClient({
    intents: 
        GatewayIntentBits.Guilds | 
        GatewayIntentBits.MessageContent | 
        GatewayIntentBits.GuildMessages | 
        GatewayIntentBits.GuildVoiceStates,
    partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.GuildScheduledEvent,
        Partials.Message,
        Partials.Reaction,
        Partials.ThreadMember,
        Partials.User
    ]
})

disableValidators()

client.manager.loadEvents()

client.login()