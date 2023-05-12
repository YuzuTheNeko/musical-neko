import { MoonlinkTrack } from "moonlink.js"
import { NekoClient } from "../core/NekoClient"
import noop from "./noop"

export default async function(client: NekoClient, track: MoonlinkTrack) {
    // Search on genius api this track using title and author.
    const search = await client.manager.genius.songs.search(`${track.title} ${track.author}`, { sanitizeQuery: true }).catch(noop)
    
    // Return if there was an error from api or if there were no matches.
    if (!search || !search.length) return null 

    // Get lyrics from song.
    const got = await search[0].lyrics(true).catch(noop)
    
    // Return if we failed to get lyrics.
    if (!got) return null 

    // Return the lyrics back.
    return got 
}