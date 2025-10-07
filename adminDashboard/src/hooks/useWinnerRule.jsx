import { useMutation, useQuery } from "@tanstack/react-query";
import { getWinnerRulesApi, createWinnerRuleApi, updateWinnerRuleApi, deleteWinnerRuleApi } from "../apis/winnerRuleApis";
import { queryClient } from "../apis/apiUtils";
import { tostMessage } from "../components/toastMessage";

export function useGetWinnerRules(params) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['winnerRules', params],
    queryFn: ({ signal }) => getWinnerRulesApi(params, signal),
    staleTime: 1000 * 60 * 5,
  });

  return { data, isPending, isError, error };
}

export function useCreateWinnerRule() {
    const {mutate, isPending, isError, error} = useMutation({
        mutationFn: createWinnerRuleApi,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['winnerRules'], exact: false })
            tostMessage('Success', data.message, 'success')
        },
        onError: (error) => {
            console.log(error)
            tostMessage('Error', error.message, 'error')
        }
    })
    return {mutate, isPending, isError, error}
}

export function useUpdateWinnerRule() {
    const {mutate, isPending, isError, error} = useMutation({
        mutationFn: updateWinnerRuleApi,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['winnerRules'], exact: false })
            tostMessage('Success', data.message, 'success')
        },
        onError: (error) => {
            console.log(error)
            tostMessage('Error', error.message, 'error')
        }
    })
    return {mutate, isPending, isError, error}
}

export function useDeleteWinnerRule() {
    const {mutate, isPending, isError, error} = useMutation({
        mutationFn: deleteWinnerRuleApi,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['winnerRules'], exact: false })
            tostMessage('Success', data.message, 'success')
        },
        onError: (error) => {
            console.log(error)
            tostMessage('Error', error.message, 'error')
        }
    })
    return {mutate, isPending, isError, error}
}