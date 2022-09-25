import { RawSongData } from "./RawSongData"

export interface CustomPlaylistData {
    userID: string
    name: string
    createdAt: number
    songs: RawSongData[]
}