import createDiscordEventListener from "../../functions/createDiscordEventListener";
import handleVoiceClientDisconnection from "../../handling/handleVoiceClientDisconnection";

export default createDiscordEventListener("voiceStateUpdate", function(oldState, newState) {
    handleVoiceClientDisconnection(this, oldState, newState)
})