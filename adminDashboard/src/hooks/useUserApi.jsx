import React from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
 import { changePasswordApi, createUserApi, deleteUserApi, forgotPasswordApi, getUserApi, getUserListApi, loginApi, logoutApi, refreshTokenApi, resetPasswordApi, updateProfileApi, updateUserApi } from '../apis/userApis'
import { tostMessage } from '../components/toastMessage'
import { useNavigate } from 'react-router-dom'
import { clearTokens, getAccessToken, saveAccessToken, saveRefreshToken } from '../utils/storageUtils'
import { queryClient } from '../apis/apiUtils'

function useUserApi() {
  const navigate = useNavigate()
  const {mutate: login, isPending: isLoginPending, isError: isLoginError, error: loginError} = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      // console.log(data)
      tostMessage('Success', data.message, 'success')
      navigate('/dashboard')
      saveAccessToken(data.token)
      saveRefreshToken(data.refreshToken)
    },
    onError: (error) => {
      // console.log(error)
      tostMessage('Error', error.message, 'error')
    },
  })

  return {
    login,
    isLoginPending,
    isLoginError,
    loginError,
  }
}

export const useLogoutApi = () => {
  const navigate = useNavigate()
  const {mutate: logout, isPending: isLogoutPending, isError: isLogoutError, error: logoutError} = useMutation({
    mutationFn: logoutApi,
    onSuccess: (data) => {
      tostMessage('Success', data.message, 'success')
      clearTokens()
      navigate('/login')
    },
    onError: (error) => {
      // console.log(error)
      tostMessage('Error', error.message, 'error')
      // Even if logout fails, clear tokens and redirect
      clearTokens()
      navigate('/login')
    },
  })

  return {
    logout,
    isLogoutPending,
    isLogoutError,
    logoutError,
  }
}

export const useFetchUserApi = () => {
  const {data, isPending, isError, error} = useQuery({
    queryKey: ['user'],
    queryFn: ({signal}) => getUserApi(signal),
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      // If 401 error, don't retry - token is invalid
      if (error?.response?.status === 401) {
        return false
      }
      return failureCount < 3
    },
    onError: (error) => {
      if (error?.response?.status === 401) {
        clearTokens()
        window.location.href = '/login'
      }
    }
  })
  return {data, isPending, isError, error}
}

export const useRefreshToken = () => {
  const {mutate: refreshToken, isPending: isRefreshing} = useMutation({
    mutationFn: refreshTokenApi,
    onSuccess: (data) => {
      saveAccessToken(data.token)
      saveRefreshToken(data.refreshToken)
    },
    onError: (error) => {
      // console.log('Token refresh failed:', error)
      clearTokens()
      window.location.href = '/login'
    },
  })

  return { refreshToken, isRefreshing }
}

export const useUpdateProfileApi = () => {
  const {mutate: updateProfile, isPending: isUpdating, isError: isUpdateError, error: updateError} = useMutation({
    mutationFn: updateProfileApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      tostMessage('Success', data.message, 'success')
    },
    onError: (error) => {
      // console.log(error)
      tostMessage('Error', error.message, 'error')
    }
  })
  return {updateProfile, isUpdating, isUpdateError, updateError}
}

export const useForgotPasswordApi = () => {
  const {mutate: forgotPassword, isPending: isForgotPasswordPending, isError: isForgotPasswordError, error: forgotPasswordError, isSuccess: isForgotPasswordSuccess} = useMutation({
    mutationFn: forgotPasswordApi,
    onSuccess: (data) => {
      tostMessage('Success', data.message, 'success')
    },
    onError: (error) => {
      // console.log(error)
      tostMessage('Error', error.message, 'error')
    }
  })
  return {forgotPassword, isForgotPasswordPending, isForgotPasswordError, forgotPasswordError, isForgotPasswordSuccess}
}

export const useResetPasswordApi = () => {
  const {mutate: resetPassword, isPending: isResetPasswordPending, isError: isResetPasswordError, error: resetPasswordError, isSuccess: isResetPasswordSuccess} = useMutation({
    mutationFn: resetPasswordApi,
    onSuccess: (data) => {
      tostMessage('Success', data.message, 'success')
    },
    onError: (error) => {
      // console.log(error)
      tostMessage('Error', error.message, 'error')
    }
  })
  return {resetPassword, isResetPasswordPending, isResetPasswordError, resetPasswordError, isResetPasswordSuccess}
}

export const useChangePasswordApi = () => {
  const {mutate: changePassword, isPending: isChangingPasswordPending, isError: isChangingPasswordError, error: changingPasswordError} = useMutation({
    mutationFn: changePasswordApi,
    onSuccess: (data) => {
      tostMessage('Success', data.message, 'success')
    },
    onError: (error) => {
      // console.log(error)
      tostMessage('Error', error.message, 'error')
    }
  })
  return {changePassword, isChangingPasswordPending, isChangingPasswordError, changingPasswordError}
}

export const useGetUserListApi = (params = {}) => {
  const {data, isPending, isError, error} = useQuery({
    queryKey: ['userList', params],
    queryFn: () => getUserListApi(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: (failureCount, error) => {
      if (error?.response?.status === 401) {
        return false
      }
      return failureCount < 3
    },
  })
  return {data, isPending, isError, error}
}

export const useCreateUserApi = () => {
  const {mutate: createUser, isPending: isCreatingUserPending, isError: isCreatingUserError, error: creatingUserError} = useMutation({
    mutationFn: createUserApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['userList'], exact: false })
      tostMessage('Success', data.message, 'success')
    },
    onError: (error) => {
      // console.log(error)
      tostMessage('Error', error.message, 'error')
    }
  })
  return {createUser, isCreatingUserPending, isCreatingUserError, creatingUserError}
}

export const useUpdateUserApi = () => {
  const {mutate: updateUser, isPending: isUpdatingUserPending, isError: isUpdatingUserError, error: updatingUserError} = useMutation({
    mutationFn: updateUserApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['userList'], exact: false })
      tostMessage('Success', data.message, 'success')
    },
    onError: (error) => {
      // console.log(error)
      tostMessage('Error', error.message, 'error')
    }
  })
  return {updateUser, isUpdatingUserPending, isUpdatingUserError, updatingUserError}
}

export const useDeleteUserApi = () => {
  const {mutate: deleteUser, isPending: isDeletingUserPending, isError: isDeletingUserError, error: deletingUserError} = useMutation({
    mutationFn: deleteUserApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['userList'], exact: false })
      tostMessage('Success', data.message, 'success')
    },
    onError: (error) => {
      // console.log(error)
      tostMessage('Error', error.message, 'error')
    }
  })
  return {deleteUser, isDeletingUserPending, isDeletingUserError, deletingUserError}
}

export default useUserApi