import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  UserProfile,
  FeedPost,
  FriendRequest,
  Report,
} from '../backend';
import { Principal } from '@icp-sdk/core/principal';
import { normalizeBackendError } from '../utils/backendErrors';
import { useGatewayStatus } from './useGatewayStatus';
import { isGatewayResolutionError } from '../utils/gatewayFallback';

export function useGetCallerProfile() {
  const { actor, isFetching } = useActor();
  const { recordSuccess, recordFailure } = useGatewayStatus();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        const result = await actor.getCallerUserProfile();
        recordSuccess();
        return result;
      } catch (error) {
        if (isGatewayResolutionError(error)) {
          recordFailure(error);
        }
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: isFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useVerifyAgeAndCreateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { recordSuccess, recordFailure } = useGatewayStatus();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.verifyAgeAndCreateProfile(profile);
        recordSuccess();
      } catch (error) {
        if (isGatewayResolutionError(error)) {
          recordFailure(error);
        }
        throw normalizeBackendError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { recordSuccess, recordFailure } = useGatewayStatus();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.saveCallerUserProfile(profile);
        recordSuccess();
      } catch (error) {
        if (isGatewayResolutionError(error)) {
          recordFailure(error);
        }
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
  const { recordSuccess, recordFailure } = useGatewayStatus();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.updateProfile(profile);
        recordSuccess();
      } catch (error) {
        if (isGatewayResolutionError(error)) {
          recordFailure(error);
        }
        throw normalizeBackendError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetProfile(principalString: string) {
  const { actor, isFetching } = useActor();
  const { recordSuccess, recordFailure } = useGatewayStatus();

  return useQuery<UserProfile | null>({
    queryKey: ['profile', principalString],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        const principal = Principal.fromText(principalString);
        const result = await actor.getUserProfile(principal);
        recordSuccess();
        return result;
      } catch (error) {
        if (isGatewayResolutionError(error)) {
          recordFailure(error);
        }
        // If blocked or unauthorized, return null instead of throwing
        const normalized = normalizeBackendError(error);
        if (
          normalized.message.includes('blocked') ||
          normalized.message.includes('permission')
        ) {
          return null;
        }
        throw normalized;
      }
    },
    enabled: !!actor && !isFetching && !!principalString,
    retry: false,
  });
}

export function useGetFeed() {
  const { actor, isFetching } = useActor();
  const { recordSuccess, recordFailure } = useGatewayStatus();

  return useQuery<FeedPost[]>({
    queryKey: ['feed'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        const result = await actor.getFeed();
        recordSuccess();
        return result;
      } catch (error) {
        if (isGatewayResolutionError(error)) {
          recordFailure(error);
        }
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { recordSuccess, recordFailure } = useGatewayStatus();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error('Actor not available');
      try {
        const result = await actor.createPost(content);
        recordSuccess();
        return result;
      } catch (error) {
        if (isGatewayResolutionError(error)) {
          recordFailure(error);
        }
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
  const { recordSuccess, recordFailure } = useGatewayStatus();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.likePost(postId);
        recordSuccess();
      } catch (error) {
        if (isGatewayResolutionError(error)) {
          recordFailure(error);
        }
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
  const { recordSuccess, recordFailure } = useGatewayStatus();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.deletePost(postId);
        recordSuccess();
      } catch (error) {
        if (isGatewayResolutionError(error)) {
          recordFailure(error);
        }
        throw normalizeBackendError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useGetFriends(principalString: string) {
  const { actor, isFetching } = useActor();
  const { recordSuccess, recordFailure } = useGatewayStatus();

  return useQuery<Principal[]>({
    queryKey: ['friends', principalString],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        const principal = Principal.fromText(principalString);
        const result = await actor.getFriends(principal);
        recordSuccess();
        return result;
      } catch (error) {
        if (isGatewayResolutionError(error)) {
          recordFailure(error);
        }
        throw error;
      }
    },
    enabled: !!actor && !isFetching && !!principalString,
  });
}

export function useGetPendingRequests() {
  const { actor, isFetching } = useActor();
  const { recordSuccess, recordFailure } = useGatewayStatus();

  return useQuery<FriendRequest[]>({
    queryKey: ['pendingRequests'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        const result = await actor.getPendingRequests();
        recordSuccess();
        return result;
      } catch (error) {
        if (isGatewayResolutionError(error)) {
          recordFailure(error);
        }
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSendFriendRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { recordSuccess, recordFailure } = useGatewayStatus();

  return useMutation({
    mutationFn: async (to: Principal) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.sendFriendRequest(to);
        recordSuccess();
      } catch (error) {
        if (isGatewayResolutionError(error)) {
          recordFailure(error);
        }
        throw normalizeBackendError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
    },
  });
}

export function useRespondToFriendRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { recordSuccess, recordFailure } = useGatewayStatus();

  return useMutation({
    mutationFn: async ({ from, accept }: { from: Principal; accept: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.respondToFriendRequest(from, accept);
        recordSuccess();
      } catch (error) {
        if (isGatewayResolutionError(error)) {
          recordFailure(error);
        }
        throw normalizeBackendError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
}

export function useReportContent() {
  const { actor } = useActor();
  const { recordSuccess, recordFailure } = useGatewayStatus();

  return useMutation({
    mutationFn: async ({
      reportedUser,
      reportedPost,
      reason,
    }: {
      reportedUser?: Principal;
      reportedPost?: bigint;
      reason: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.reportContent(
          reportedUser || null,
          reportedPost || null,
          reason
        );
        recordSuccess();
      } catch (error) {
        if (isGatewayResolutionError(error)) {
          recordFailure(error);
        }
        throw normalizeBackendError(error);
      }
    },
  });
}

export function useBlockUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { recordSuccess, recordFailure } = useGatewayStatus();

  return useMutation({
    mutationFn: async (target: Principal) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.blockUser(target);
        recordSuccess();
      } catch (error) {
        if (isGatewayResolutionError(error)) {
          recordFailure(error);
        }
        throw normalizeBackendError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
    },
  });
}

export function useUnblockUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { recordSuccess, recordFailure } = useGatewayStatus();

  return useMutation({
    mutationFn: async (target: Principal) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.unblockUser(target);
        recordSuccess();
      } catch (error) {
        if (isGatewayResolutionError(error)) {
          recordFailure(error);
        }
        throw normalizeBackendError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
    },
  });
}

export function useGetBlockedUsers() {
  const { actor, isFetching } = useActor();
  const { recordSuccess, recordFailure } = useGatewayStatus();

  return useQuery<Principal[]>({
    queryKey: ['blockedUsers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        const result = await actor.getBlockedUsers();
        recordSuccess();
        return result;
      } catch (error) {
        if (isGatewayResolutionError(error)) {
          recordFailure(error);
        }
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsUserBlocked(target: Principal | null) {
  const { actor, isFetching } = useActor();
  const { recordSuccess, recordFailure } = useGatewayStatus();

  return useQuery<boolean>({
    queryKey: ['isBlocked', target?.toString()],
    queryFn: async () => {
      if (!actor || !target) return false;
      try {
        const result = await actor.isUserBlocked(target);
        recordSuccess();
        return result;
      } catch (error) {
        if (isGatewayResolutionError(error)) {
          recordFailure(error);
        }
        console.error('Error checking block status:', error);
        return false;
      }
    },
    enabled: !!actor && !isFetching && !!target,
  });
}

export function useDeleteOwnAccount() {
  const { actor } = useActor();
  const { recordSuccess, recordFailure } = useGatewayStatus();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.deleteOwnAccount();
        recordSuccess();
      } catch (error) {
        if (isGatewayResolutionError(error)) {
          recordFailure(error);
        }
        throw normalizeBackendError(error);
      }
    },
  });
}
