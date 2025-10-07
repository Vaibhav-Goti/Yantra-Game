import apiUtils from "./apiUtils"

export const getMachineTransactionHistoryApi = async (params, signal) => {
    let url = '/machine/transactions'
    if(params){
        url += `?${new URLSearchParams(params).toString()}`
    }
    return apiUtils('GET', url, {}, null, signal)
}

export const addAmountToMachineApi = async (data) => {
    return apiUtils('POST', '/machine/add-amount', {}, data, null)
}

export const withdrawAmountFromMachineApi = async (data) => {
    return apiUtils('POST', '/machine/withdraw-amount', {}, data, null)
}

export const getMachineBalanceSummaryApi = async (params, signal) => {
    let url = '/machine/balance-summary'
    if(params){
        url += `?${new URLSearchParams(params).toString()}`
    }
    return apiUtils('GET', url, {}, null, signal)
}
