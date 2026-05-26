import { useQuery } from '@tanstack/react-query';

import { fetchUserRepos } from '@/queries/lib/repositories/fetch-user-repos';
import { repositoryKeys } from '@/queries/keys';
import { AppError, userFacingMessage } from '@/lib/errors';

type UseGithubReposQueryOptions = {
  token: string | null;
  enabled?: boolean;
};

export function useGithubReposQuery({
  token,
  enabled = true,
}: UseGithubReposQueryOptions) {
  return useQuery({
    queryKey: repositoryKeys.github(),
    enabled: enabled && Boolean(token),
    staleTime: 5 * 60_000,
    queryFn: async () => {
      if (!token) {
        throw new Error(
          'GitHub access is not available for this session. Reconnect GitHub to grant repository access (required on web after sign-in).'
        );
      }
      try {
        return await fetchUserRepos(token);
      } catch (e) {
        if (e instanceof AppError) {
          throw e;
        }
        throw new Error(userFacingMessage('github'));
      }
    },
  });
}
