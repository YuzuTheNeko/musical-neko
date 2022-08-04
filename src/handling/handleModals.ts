import { ModalSubmitInteraction } from "discord.js";
import { NekoClient } from "../core/NekoClient";
import handleMusicVolumeModal from "./modals/handleMusicVolumeModal";

export default function(client: NekoClient, i: ModalSubmitInteraction<'cached'>) {
    handleMusicVolumeModal(client, i)
}