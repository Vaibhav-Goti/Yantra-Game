import apiUtils from "./apiUtils"

export const getWinnerRulesApi = async (params, signal) => {
    let url = '/winnerrule/get'
    if(params){
        url += `?${new URLSearchParams(params).toString()}`
    }
    return apiUtils('GET', url, {}, null, signal)
}

export const createWinnerRuleApi = async (data) => {
    return apiUtils('POST', '/winnerrule/create', {}, data, null)
}

export const updateWinnerRuleApi = async (data) => {
    return apiUtils('POST', '/winnerrule/update', {}, data, null)
}

export const deleteWinnerRuleApi = async (data) => {
    return apiUtils('POST', '/winnerrule/delete', {}, data, null)
}
