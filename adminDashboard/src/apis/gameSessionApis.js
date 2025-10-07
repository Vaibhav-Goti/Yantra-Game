import apiUtils from "./apiUtils"

export const getGameSessionsApi = async (params, signal) => {
    let url = '/hardware/game-sessions'
    if(params){
        url += `?${new URLSearchParams(params).toString()}`
    }
    return apiUtils('GET', url, {}, null, signal)
}

export const getGameSessionByIdApi = async (sessionId, signal) => {
    return apiUtils('GET', `/hardware/game-session/${sessionId}`, {}, null, signal)
}
