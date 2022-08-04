import { AutocompleteInteraction, ButtonInteraction, ModalSubmitInteraction } from "discord.js";
import createDiscordEventListener from "../../functions/createDiscordEventListener";
import handleAutocomplete from "../../handling/handleAutocomplete";
import handleButtons from "../../handling/handleButtons";
import handleModals from "../../handling/handleModals";
import handleSlashCommand from "../../handling/handleSlashCommand";

export default createDiscordEventListener("interactionCreate", function (interaction) {
    if (interaction.isChatInputCommand()) {
        handleSlashCommand(this, interaction)
    } else if (interaction.isAutocomplete()) {
        handleAutocomplete(this, interaction as AutocompleteInteraction<'cached'>)
    } else if (interaction.isButton()) {
        handleButtons(this, interaction as ButtonInteraction<'cached'>)
    } else if (interaction.isModalSubmit()) {
        handleModals(this, interaction as ModalSubmitInteraction<'cached'>)
    }
})