import apiUtils from "./apiUtils"

export const getTimeFrameApi = async (params, signal) => {
    let url = '/timeframe/all'
    if(params){
        url += `?${new URLSearchParams(params).toString()}`
    }
    return apiUtils('GET', url, {}, null, signal)
}

export const createTimeFrameApi = async (data) => {
    return apiUtils('POST', '/timeframe/create', {}, data, null)
};

export const updateTimeFrameApi = async (data) => {
    return apiUtils('POST', '/timeframe/update', {}, data, null)
};

export const getTimeFramesByMachineApi = async (params) => {
    return apiUtils('POST', '/timeframe/by-machine', {}, params)
};

export const updateBulkTimeFramesApi = async (data) => {
    return apiUtils('POST', '/timeframe/update-bulk', {}, data, null)
};