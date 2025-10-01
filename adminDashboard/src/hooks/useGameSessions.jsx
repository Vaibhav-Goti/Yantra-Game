import { useQuery } from "@tanstack/react-query"
import { getGameSessionApi } from "../apis/gameSessionApi"

export const useGameSessions = (params) => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['gameSessions', params],
        queryFn: ({ signal }) => getGameSessionApi(params, signal),
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
