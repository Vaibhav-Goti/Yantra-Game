import { useMutation, useQuery } from "@tanstack/react-query"
import { createTimeFrameApi, getTimeFrameApi, updateTimeFrameApi, getTimeFramesByMachineApi, updateBulkTimeFramesApi } from "../apis/timeFrameApis"
import { queryClient } from "../apis/apiUtils"
import { tostMessage } from "../components/toastMessage"

export const useTimeFrame = (params) => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['timeFrame', params],
        queryFn: ({ signal }) => getTimeFrameApi(params, signal),
        staleTime: 1000 * 60 * 5,
        retry: (failureCount, error) => {
            if (error?.response?.status === 401) {
                return false
            }
            return failureCount < 3
        },
    })
    return { data, isLoading, isError, error }
}

export const useCreateTimeFrame = () => {
    const { mutate, isPending, isError, error } = useMutation({
        mutationFn: createTimeFrameApi,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['timeFrame'], exact: false })
            tostMessage('Success', data.message, 'success')
        },
        onError: (error) => {
            console.log(error)
            tostMessage('Error', error.message, 'error')
        }
    })
    return { mutate, isPending, isError, error }
}

export const useUpdateTimeFrame = () => {
    const { mutate, isPending, isError, error } = useMutation({
        mutationFn: updateTimeFrameApi,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['timeFrame'], exact: false })
            tostMessage('Success', data.message, 'success')
        },
        onError: (error) => {
            console.log(error)
            tostMessage('Error', error.message, 'error')
        }
    })
    return { mutate, isPending, isError, error }
}

export const useTimeFramesByMachine = () => {
    const { mutate, data, isPending, isError, error } = useMutation({
        mutationFn: getTimeFramesByMachineApi,
    })
    return { mutate, data, isPending, isError, error }
}

export const useUpdateBulkTimeFrames = () => {
    const { mutate, isPending, isError, error } = useMutation({
        mutationFn: updateBulkTimeFramesApi,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['timeFrame'], exact: false })
            tostMessage('Success', data.message, 'success')
        },
        onError: (error) => {
            console.log(error)
            tostMessage('Error', error.message, 'error')
        }
    })
    return { mutate, isPending, isError, error }
}
