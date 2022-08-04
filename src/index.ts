import { GatewayIntentBits } from "discord.js";
import { NekoClient } from "./core/NekoClient";

const client = new NekoClient({
    intents: 
        GatewayIntentBits.Guilds | 
        GatewayIntentBits.MessageContent | 
        GatewayIntentBits.GuildMessages | 
        GatewayIntentBits.GuildVoiceStates
})

client.manager.loadEvents()

client.login()