import { EnumLike } from "./EnumLike";

export type GetEnum<T> = T extends EnumLike<infer P> ? P : never