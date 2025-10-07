import { useMutation, useQuery } from "@tanstack/react-query";
import { getMachineTransactionHistoryApi, addAmountToMachineApi, withdrawAmountFromMachineApi, getMachineBalanceSummaryApi } from "../apis/machineTransactionApis";
import { queryClient } from "../apis/apiUtils";
import { tostMessage } from "../components/toastMessage";

export function useGetMachineTransactionHistory(params) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['machineTransactions', params],
    queryFn: ({ signal }) => getMachineTransactionHistoryApi(params, signal),
    staleTime: 1000 * 60 * 2,
  });

  return { data, isPending, isError, error };
}

export function useGetMachineBalanceSummary(params) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['machineBalanceSummary', params],
    queryFn: ({ signal }) => getMachineBalanceSummaryApi(params, signal),
    staleTime: 1000 * 60 * 2,
  });

  return { data, isPending, isError, error };
}

export function useAddAmountToMachine() {
    const {mutate, isPending, isError, error} = useMutation({
        mutationFn: addAmountToMachineApi,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['machineTransactions'], exact: false })
            queryClient.invalidateQueries({ queryKey: ['machineBalanceSummary'], exact: false })
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

export function useWithdrawAmountFromMachine() {
    const {mutate, isPending, isError, error} = useMutation({
        mutationFn: withdrawAmountFromMachineApi,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['machineTransactions'], exact: false })
            queryClient.invalidateQueries({ queryKey: ['machineBalanceSummary'], exact: false })
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