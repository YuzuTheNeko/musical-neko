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

export const MAX_VOLUME = 200 as const 
export const MIN_VOLUME = 0 as const 

export const TRACK_VOLUME_MODAL = 'track_volume_modal' as const
export const UNNEEDED_CUSTOM_ID = () => `unused_${performance.now()}`