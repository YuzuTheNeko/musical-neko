export type SkipFirstParameter<T extends any[]> = T extends [any, ...infer Rest] ? Rest : T 
export type SkipSecondParameter<T extends any[]> = T extends [infer First, any, ...infer Rest] ? [ 
    First, 
    ...Rest ] : T

export type SkipFirstTwoParameters<T extends any[]> = T extends [any, any, ...infer Rest] ? Rest : T 

export type SkipThirdParameter<T extends any[]> = T extends [infer First, infer Second, any, ...infer Rest] ? [
    First,
    Second,
    ...Rest 
] : T 

export type SkipFirstThreeParameters<T extends any[]> = T extends [
    any,
    any,
    any,
    ...infer Rest 
] ? Rest : T 