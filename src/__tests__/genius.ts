import { NekoClient } from "../core/NekoClient";

const t = new NekoClient({ intents: 0 })

t.manager.genius.songs.search("kaze agua pasa")
.then(c => {
    c[0].lyrics(true).then(console.log)
})