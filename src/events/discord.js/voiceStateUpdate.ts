import createDiscordEventListener from "../../functions/createDiscordEventListener";
import handleEmptyVoice from "../../handling/handleEmptyVoice";
import handleVoiceClientDisconnection from "../../handling/handleVoiceClientDisconnection";

export default createDiscordEventListener("voiceStateUpdate", function(oldState, newState) {
    handleVoiceClientDisconnection(this, oldState, newState)
    handleEmptyVoice(this, oldState, newState)
})