import apiUtils from "./apiUtils"

export const getGameSessionApi = async (params, signal) => {
    let url = '/hardware/sessions'
    if(params){
        url += `?${new URLSearchParams(params).toString()}`
    }
    return apiUtils('GET', url, {}, null, signal)
}