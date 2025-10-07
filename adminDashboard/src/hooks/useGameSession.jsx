import { useQuery } from "@tanstack/react-query";
import { getGameSessionsApi, getGameSessionByIdApi } from "../apis/gameSessionApis";

export function useGetGameSessions(params) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['gameSessions', params],
    queryFn: ({ signal }) => getGameSessionsApi(params, signal),
    staleTime: 1000 * 60 * 2,
  });

  return { data, isPending, isError, error };
}

export function useGetGameSessionById(sessionId) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['gameSession', sessionId],
    queryFn: ({ signal }) => getGameSessionByIdApi(sessionId, signal),
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 5,
  });

  return { data, isPending, isError, error };
}