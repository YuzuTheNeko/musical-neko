import { UnwrapAllFlags } from "arg-capturer/dist/typings/types/UnwrapFlags";
import { ArgData } from "./ArgData";
import { CommandData } from "./CommandData";

export interface ExtrasData<Args extends [...ArgData[]]> {
    command: CommandData<Args>
}