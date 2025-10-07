import { useMutation, useQuery } from "@tanstack/react-query";
import { getJackpotWinnersApi, createJackpotWinnerApi, updateJackpotWinnerApi, deleteJackpotWinnerApi } from "../apis/jackpotWinnerApis";
import { queryClient } from "../apis/apiUtils";
import { tostMessage } from "../components/toastMessage";

export function useGetJackpotWinners(params) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['jackpotWinners', params],
    queryFn: ({ signal }) => getJackpotWinnersApi(params, signal),
    staleTime: 1000 * 60 * 5,
  });

  return { data, isPending, isError, error };
}

export function useCreateJackpotWinner() {
    const {mutate, isPending, isError, error} = useMutation({
        mutationFn: createJackpotWinnerApi,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['jackpotWinners'], exact: false })
            tostMessage('Success', data.message, 'success')
        },
        onError: (error) => {
            console.log(error)
            tostMessage('Error', error.message, 'error')
        }
    })
    return {mutate, isPending, isError, error}
}

export function useUpdateJackpotWinner() {
    const {mutate, isPending, isError, error} = useMutation({
        mutationFn: updateJackpotWinnerApi,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['jackpotWinners'], exact: false })
            tostMessage('Success', data.message, 'success')
        },
        onError: (error) => {
            console.log(error)
            tostMessage('Error', error.message, 'error')
        }
    })
    return {mutate, isPending, isError, error}
}

export function useDeleteJackpotWinner() {
    const {mutate, isPending, isError, error} = useMutation({
        mutationFn: deleteJackpotWinnerApi,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['jackpotWinners'], exact: false })
            tostMessage('Success', data.message, 'success')
        },
        onError: (error) => {
            console.log(error)
            tostMessage('Error', error.message, 'error')
        }
    })
    return {mutate, isPending, isError, error}
}