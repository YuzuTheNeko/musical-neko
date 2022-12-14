import { ButtonInteraction } from "discord.js";
import { NekoClient } from "../core/NekoClient";
import handleBotDisconnect from "./buttons/handleBotDisconnect";
import handleMusicBackward from "./buttons/handleMusicBackward";
import handleMusicFavorite from "./buttons/handleMusicFavorite";
import handleMusicForward from "./buttons/handleMusicForward";
import handleMusicLast from "./buttons/handleMusicLast";
import handleMusicPause from "./buttons/handleMusicPause";
import handleMusicRecent from "./buttons/handleMusicRecent";
import handleMusicReplay from "./buttons/handleMusicReplay";
import handleMusicSkip from "./buttons/handleMusicSkip";
import handleMusicVolume from "./buttons/handleMusicVolume";
import handleQueue from "./buttons/handleQueue";
import handlePlaylist from "./buttons/handlePlaylist"

export default function(client: NekoClient, i: ButtonInteraction<'cached'>) {
    handleMusicPause(client, i)
    handleMusicLast(client, i)
    handlePlaylist(client, i)
    handleMusicRecent(client, i)
    handleMusicFavorite(client, i)
    handleBotDisconnect(client, i)
    handleMusicVolume(client, i)
    handleMusicSkip(client, i)
    handleMusicBackward(client, i)
    handleMusicForward(client, i)
    handleQueue(client, i)
    handleMusicReplay(client, i)
}