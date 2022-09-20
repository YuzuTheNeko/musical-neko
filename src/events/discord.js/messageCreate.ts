import { Message } from "discord.js";
import createDiscordEventListener from "../../functions/createDiscordEventListener";
import handleCommand from "../../handling/handleCommand";

export default createDiscordEventListener("messageCreate", function (m) {
    if (m.partial || !m.guildId) return;

    handleCommand(this, m as Message<true>)
})