import apiUtils from "./apiUtils"

export const getMachinesApi = async (params ,signal) => {
    let url = '/machine/all'
    if(params){
        url += `?${new URLSearchParams(params).toString()}`
    }
    return apiUtils('GET', url, {}, null, signal)
}

export const addMachineApi = async (data) => {
    return apiUtils('POST', '/machine/create', {}, data, null)
}

export const deleteMachineApi = async (data) => {
    return apiUtils('POST', '/machine/delete', {}, data, null)
}

export const updateMachineApi = async (data) => {
    return apiUtils('POST', '/machine/update', {}, data, null)
}
