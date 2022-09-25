import { Column } from "rhino.db/dist/structures"
import { DatabaseInterface } from "./typings/interfaces/DatabaseTables"

export const IDLE_TIMEOUT = 60_000 as const 
export const VOICE_ERROR = 'Voice Error' as const 
export const TRACK_ERROR = 'Track Error' as const 

export const TRACK_PAUSE = 'track_pause' as const 
export const TRACK_FORWARD = 'track_forward' as const 
export const TRACK_BACKWARD = 'track_backward' as const 
export const TRACK_FIRST = 'track_first' as const 
export const BOT_DISCONNECT = `bot_disconnect` as const 
export const TRACK_LAST = 'track_last' as const 
export const TRACK_FAVORITE = 'track_favorite' as const 
export const TRACK_VOLUME = 'track_volume' as const 
export const TRACK_REPLAY = 'track_replay' as const 
export const TRACK_SKIP = 'track_skip' as const 

export const QUEUE_NEXT_ID = `queue_next` as const 
export const QUEUE_BACK_ID = `queue_back` as const 

export const PLAYLIST_NEXT_ID = `playlist_next` as const 
export const PLAYLIST_BACK_ID = `playlist_back` as const 

export const QUEUE_NEXT = (id: string, page: number) => `${QUEUE_NEXT_ID}_${page}_${id}` as const
export const QUEUE_BACK = (id: string, page: number) => `${QUEUE_BACK_ID}_${page}_${id}` as const 

export const PLAYLIST_NEXT = (id: string, name: string, page: number) => `${PLAYLIST_NEXT_ID}_${name}_${page}_${id}` as const
export const PLAYLIST_BACK = (id: string, name: string, page: number) => `${PLAYLIST_BACK_ID}_${name}_${page}_${id}` as const 

export const MAX_VOLUME = 200 as const 
export const MIN_VOLUME = 0 as const 

export const TRACK_VOLUME_MODAL = 'track_volume_modal' as const
export const UNNEEDED_CUSTOM_ID = () => `unused_${performance.now()}`

export const Tables: DatabaseInterface = {
    customPlaylists: {
        createdAt: new Column()
        .setName('createdAt')
        .setType('INT'),
        name: new Column()
        .setName('name')
        .setType('TEXT'),
        userID: new Column()
        .setName('userID')
        .setType('TEXT'),
        songs: new Column()
        .setName('songs')
        .setDefault(() => [])
        .setType('JSON')
    },
    favoriteSongs: {
        favoritedAt: new Column()
        .setName('favoritedAt')
        .setType('INT'),
        title: new Column()
        .setName('title')
        .setType('TEXT'),
        url: new Column()
        .setName('url')
        .setType('TEXT'),
        userID: new Column()
        .setName('userID')
        .setType('TEXT')
    }
}

export const MAX_FAVORITED_SONGS = 25 as const 
export const MAX_CUSTOM_PLAYLISTS = 25 as const 