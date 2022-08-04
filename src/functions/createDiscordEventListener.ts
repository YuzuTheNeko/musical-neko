import { ClientEvents } from "discord.js";
import { NekoClient } from "../core/NekoClient";

type EventHandler<T extends keyof ClientEvents> = (this: NekoClient, ...args: ClientEvents[T]) => void | Promise<void>

export default function<T extends keyof ClientEvents>(event: T, cb: EventHandler<T>): EventHandler<T> {
    return cb 
}