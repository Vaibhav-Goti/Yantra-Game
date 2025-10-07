import apiUtils from "./apiUtils"

export const getJackpotWinnersApi = async (params, signal) => {
    let url = '/jackpotwinner/get'
    if(params){
        url += `?${new URLSearchParams(params).toString()}`
    }
    return apiUtils('GET', url, {}, null, signal)
}

export const createJackpotWinnerApi = async (data) => {
    return apiUtils('POST', '/jackpotwinner/create', {}, data, null)
}

export const updateJackpotWinnerApi = async (data) => {
    return apiUtils('POST', '/jackpotwinner/update', {}, data, null)
}

export const deleteJackpotWinnerApi = async (data) => {
    return apiUtils('POST', '/jackpotwinner/delete', {}, data, null)
}
