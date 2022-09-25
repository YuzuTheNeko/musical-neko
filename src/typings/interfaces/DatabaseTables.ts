import { CustomPlaylistData } from "./CustomPlaylistData";
import { FavoriteSongData } from "./FavoriteSongData";
import { Column } from "rhino.db"

export interface DatabaseTables {
    favoriteSongs: FavoriteSongData
    customPlaylists: CustomPlaylistData
}

export type DatabaseInterface = {
    [P in keyof DatabaseTables]: Record<keyof DatabaseTables[P], Column<true>>
}