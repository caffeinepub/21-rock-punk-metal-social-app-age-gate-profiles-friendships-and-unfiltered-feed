import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, FeedPost, FriendRequest, Genre } from '../backend';
import { Principal } from '@dfinity/principal';
import { normalizeBackendError } from '../utils/backendErrors';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetProfile(userPrincipal: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', userPrincipal],
    queryFn: async () => {
      if (!actor || !userPrincipal) return null;
      try {
        const principal = Principal.fromText(userPrincipal);
        return await actor.getUserProfile(principal);
      } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!userPrincipal,
  });
}

export function useVerifyAgeAndCreateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.verifyAgeAndCreateProfile(profile);
      } catch (error) {
        throw normalizeBackendError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.updateProfile(profile);
      } catch (error) {
        throw normalizeBackendError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Feed Queries
export function useGetFeed() {
  const { actor, isFetching } = useActor();

  return useQuery<FeedPost[]>({
    queryKey: ['feed'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeed();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.createPost(content);
      } catch (error) {
        throw normalizeBackendError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useLikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.likePost(postId);
      } catch (error) {
        throw normalizeBackendError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useDeletePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.deletePost(postId);
      } catch (error) {
        throw normalizeBackendError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

// Friends Queries
export function useGetFriends() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Principal[]>({
    queryKey: ['friends'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const principal = identity.getPrincipal();
      return actor.getFriends(principal);
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetPendingRequests() {
  const { actor, isFetching } = useActor();

  return useQuery<FriendRequest[]>({
    queryKey: ['pendingRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSendFriendRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (toPrincipal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.sendFriendRequest(toPrincipal);
      } catch (error) {
        throw normalizeBackendError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
    },
  });
}

export function useRespondToFriendRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ from, accept }: { from: Principal; accept: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.respondToFriendRequest(from, accept);
      } catch (error) {
        throw normalizeBackendError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
    },
  });
}

// Report Mutation
export function useReportContent() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      reportedUser,
      reportedPost,
      reason,
    }: {
      reportedUser: Principal | null;
      reportedPost: bigint | null;
      reason: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.reportContent(reportedUser, reportedPost, reason);
      } catch (error) {
        throw normalizeBackendError(error);
      }
    },
  });
}
