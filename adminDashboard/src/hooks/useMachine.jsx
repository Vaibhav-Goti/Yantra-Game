import { useMutation, useQuery } from "@tanstack/react-query";
import { addMachineApi, deleteMachineApi, getMachinesApi, updateMachineApi } from "../apis/machineAPis";
import { queryClient } from "../apis/apiUtils";
import { tostMessage } from "../components/toastMessage";

export function useGetMachines(params) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['machines', params], // cache key depends on params
    queryFn: ({ signal }) => getMachinesApi(params, signal),
    staleTime: 1000 * 60 * 5, // 5 min cache
  });

  return { data, isPending, isError, error };
}

export function useAddMachine() {
    const {mutate, isPending, isError, error} = useMutation({
        mutationFn: addMachineApi,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['machines'], exact: false })
            tostMessage('Success', data.message, 'success')
        },
        onError: (error) => {
            console.log(error)
            tostMessage('Error', error.message, 'error')
        }
    })
    return {mutate, isPending, isError, error}
}

export function useDeleteMachine() {
    const {mutate, isPending, isError, error} = useMutation({
        mutationFn: deleteMachineApi,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['machines'], exact: false })
            tostMessage('Success', data.message, 'success')
        },
        onError: (error) => {
            console.log(error)
            tostMessage('Error', error.message, 'error')
        }
    })
    return {mutate, isPending, isError, error}
}

export function useUpdateMachine() {
    const {mutate, isPending, isError, error} = useMutation({
        mutationFn: updateMachineApi,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['machines'], exact: false })
            tostMessage('Success', data.message, 'success')
        },
        onError: (error) => {
            console.log(error)
            tostMessage('Error', error.message, 'error')
        }
    })
    
    return {mutate, isPending, isError, error}
}

