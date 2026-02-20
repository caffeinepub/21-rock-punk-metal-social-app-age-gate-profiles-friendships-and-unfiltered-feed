import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface FriendRequest {
    to: Principal;
    status: Variant_pending_rejected_accepted;
    from: Principal;
    timestamp: Time;
}
export type Time = bigint;
export interface Report {
    reportedPost?: bigint;
    reportedUser?: Principal;
    timestamp: Time;
    reporter: Principal;
    reason: string;
}
export type Genre = {
    __kind__: "metal";
    metal: null;
} | {
    __kind__: "grunge";
    grunge: null;
} | {
    __kind__: "other";
    other: string;
} | {
    __kind__: "punk";
    punk: null;
} | {
    __kind__: "rock";
    rock: null;
} | {
    __kind__: "hardcore";
    hardcore: null;
} | {
    __kind__: "indie";
    indie: null;
} | {
    __kind__: "alternative";
    alternative: null;
};
export interface UserProfile {
    bio: string;
    displayName: string;
    favoriteBands: Array<string>;
    isAgeVerified: boolean;
    favoriteGenres: Array<Genre>;
    avatarUrl?: string;
    location?: string;
}
export interface FeedPost {
    id: bigint;
    content: string;
    author: Principal;
    likes: Array<Principal>;
    timestamp: Time;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_pending_rejected_accepted {
    pending = "pending",
    rejected = "rejected",
    accepted = "accepted"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    blockUser(target: Principal): Promise<void>;
    createPost(content: string): Promise<bigint>;
    deleteOwnAccount(): Promise<void>;
    deletePost(postId: bigint): Promise<void>;
    getBlockedUsers(): Promise<Array<Principal>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFeed(): Promise<Array<FeedPost>>;
    getFriends(user: Principal): Promise<Array<Principal>>;
    getPendingRequests(): Promise<Array<FriendRequest>>;
    getReports(): Promise<Array<[bigint, Array<Report>]>>;
    getUserPosts(user: Principal): Promise<Array<FeedPost>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isUserBlocked(target: Principal): Promise<boolean>;
    likePost(postId: bigint): Promise<void>;
    reportContent(reportedUser: Principal | null, reportedPost: bigint | null, reason: string): Promise<void>;
    respondToFriendRequest(from: Principal, accept: boolean): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendFriendRequest(to: Principal): Promise<void>;
    unblockUser(target: Principal): Promise<void>;
    updateProfile(profile: UserProfile): Promise<void>;
    verifyAgeAndCreateProfile(profile: UserProfile): Promise<void>;
}
