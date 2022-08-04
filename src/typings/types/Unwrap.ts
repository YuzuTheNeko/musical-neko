import { ArgType } from "../enums/ArgType";
import { ArgData, DefaultMethod } from "../interfaces/ArgData";
import { EnumLike } from "./EnumLike";
import { GetEnum } from "./GetEnum";
import { IsArray } from "./IsArray";
import { MarkNullable } from "./MarkNullable";

export type UnwrapArgType<Type extends ArgType, Enum extends EnumLike, Choices extends string[]> = 
    Type extends ArgType.Number ? number :
    Type extends ArgType.String ? IsArray<Choices> extends true ? Choices[number] : string : 
    Type extends ArgType.Enum ? GetEnum<Enum> :  
    never

export type IsMethod<T> = T extends DefaultMethod<any, any, any> ? true : false

export type UnwrapArgData<T> = T extends ArgData<infer Type, infer Required, infer Enum, infer Choices> ? IsMethod<T["default"]> extends true ? UnwrapArgType<Type, Enum, Choices> | ReturnType<Exclude<T["default"], undefined>> : MarkNullable<UnwrapArgType<Type, Enum, Choices>, Required> : never

export type UnwrapArgDataTuple<T> = T extends [infer L, ...infer R] ? [UnwrapArgData<L>, ...UnwrapArgDataTuple<R>] : []