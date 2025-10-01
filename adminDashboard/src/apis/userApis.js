import apiUtils from "./apiUtils";

export const loginApi = async (data) => {
    console.log(data)
    return apiUtils('POST', '/login', {}, data)
}

export const logoutApi = async (data) => {
    return apiUtils('POST', '/logout', {}, data)
}

export const refreshTokenApi = async (data) => {
    return apiUtils('POST', '/refresh', {}, data)
}

export const getUserApi = async (signal) => {
    return apiUtils('GET', '/get/profile', {}, null, signal)
}

export const updateProfileApi = async (data) => {
    return apiUtils('POST', '/update/profile', {}, data)
}

export const forgotPasswordApi = async (data) => {
    return apiUtils('POST', '/forgot-password', {}, data)
}

export const resetPasswordApi = async (data) => {
    return apiUtils('POST', '/reset-password', {}, data)
}

export const changePasswordApi = async (data) => {
    return apiUtils('POST', '/change-password', {}, data)
}

export const getUserListApi = async (params, signal) => {
    // Build query string from params
    let url = '/all'
    if(params){
        url += `?${new URLSearchParams(params).toString()}`
    }
    
    return apiUtils('GET', url, {}, null, signal)
}

export const getUserByIdApi = async (data) => {
    return apiUtils('GET', '/get/user', {}, data)
}

export const createUserApi = async (data) => {
    return apiUtils('POST', '/create/user', {}, data)
}

export const updateUserApi = async (data) => {
    return apiUtils('POST', '/update', {}, data)
}

export const deleteUserApi = async (data) => {
    return apiUtils('POST', '/delete', {}, data)
}