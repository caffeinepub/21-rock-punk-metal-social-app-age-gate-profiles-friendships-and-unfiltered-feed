import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Char "mo:core/Char";


import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Explicit migration from old to new actor state

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type Genre = {
    #rock;
    #punk;
    #metal;
    #hardcore;
    #alternative;
    #grunge;
    #indie;
    #other : Text;
  };

  public type UserProfile = {
    displayName : Text;
    avatarUrl : ?Text;
    bio : Text;
    favoriteGenres : [Genre];
    favoriteBands : [Text];
    location : ?Text;
    isAgeVerified : Bool;
  };

  public type FriendRequest = {
    from : Principal;
    to : Principal;
    status : {
      #pending;
      #accepted;
      #rejected;
    };
    timestamp : Time.Time;
  };

  public type FeedPost = {
    id : Nat;
    author : Principal;
    content : Text;
    timestamp : Time.Time;
    likes : [Principal];
  };

  public type Report = {
    reporter : Principal;
    reportedUser : ?Principal;
    reportedPost : ?Nat;
    reason : Text;
    timestamp : Time.Time;
  };

  module FeedPost {
    public func compareByTimestamp(post1 : FeedPost, post2 : FeedPost) : Order.Order {
      Int.compare(post2.timestamp, post1.timestamp);
    };
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let friendRequests = Map.empty<Principal, List.List<FriendRequest>>();
  let friends = Map.empty<Principal, List.List<Principal>>();
  let feedPosts = Map.empty<Nat, FeedPost>();
  let reports = Map.empty<Nat, List.List<Report>>();
  var idCounter = 0;
  var maxRequestsPerUser = 10;
  let rateLimitWindow : Int = 60_000_000_000;

  type RateLimitEntry = {
    timestamp : Int;
    requestCount : Nat;
  };

  let rateLimitMap = Map.empty<Principal, RateLimitEntry>();

  let maxDisplayNameLength = 50;
  let minDisplayNameLength = 4;
  let maxBioLength = 500;
  let maxPostContentLength = 420;
  let maxReasonLength = 500;
  let maxGenreTextLength = 100;
  let maxBandNameLength = 100;
  let maxLocationLength = 150;
  let maxAvatarUrlLength = 300;
  let maxFavoriteGenres = 10;
  let maxFavoriteBands = 50;

  func isAgeVerified(user : Principal) : Bool {
    switch (userProfiles.get(user)) {
      case (null) { false };
      case (?profile) { profile.isAgeVerified };
    };
  };

  let userBlocks = Map.empty<Principal, List.List<Principal>>();

  func isUserBlockedBy(blocker : Principal, target : Principal) : Bool {
    switch (userBlocks.get(blocker)) {
      case (null) { false };
      case (?blockList) { blockList.any(func(b) { b == target }) };
    };
  };

  func areUsersMutuallyBlockedInternal(user1 : Principal, user2 : Principal) : Bool {
    isUserBlockedBy(user1, user2) or isUserBlockedBy(user2, user1);
  };

  func checkRequestLimit(caller : Principal) {
    let currentTime = Time.now();

    switch (rateLimitMap.get(caller)) {
      case (null) {
        let entry : RateLimitEntry = {
          timestamp = currentTime;
          requestCount = 1;
        };
        rateLimitMap.add(caller, entry);
      };
      case (?entry) {
        if (currentTime - entry.timestamp < rateLimitWindow) {
          if (entry.requestCount >= maxRequestsPerUser) {
            Runtime.trap("Rate limit exceeded. Please try again later.");
          } else {
            let updatedEntry : RateLimitEntry = {
              timestamp = entry.timestamp;
              requestCount = entry.requestCount + 1;
            };
            rateLimitMap.add(caller, updatedEntry);
          };
        } else {
          let newEntry : RateLimitEntry = {
            timestamp = currentTime;
            requestCount = 1;
          };
          rateLimitMap.add(caller, newEntry);
        };
      };
    };
  };

  func validateDisplayName(name : Text) {
    if (name.size() < minDisplayNameLength or name.size() > maxDisplayNameLength) {
      Runtime.trap(
        "Display name must be between " # minDisplayNameLength.toText() # " and " # maxDisplayNameLength.toText() # " characters"
      );
    };

    for (char in name.chars()) {
      let valid = char >= 'a' and char <= 'z' or char >= 'A' and char <= 'Z' or char >= '0' and char <= '9' or char == '-';

      if (not valid) {
        Runtime.trap("Display name contains invalid character: '" # Text.fromChar(char) # "'. Allowed characters: letters, numbers, hyphens ('-')");
      };
    };
  };

  func validateProfile(profile : UserProfile) {
    validateDisplayName(profile.displayName);

    if (profile.bio.size() > maxBioLength) {
      Runtime.trap("Bio is too long");
    };
    if (profile.favoriteGenres.size() > maxFavoriteGenres) {
      Runtime.trap("Too many favorite genres");
    };
    if (profile.favoriteBands.size() > maxFavoriteBands) {
      Runtime.trap("Too many favorite bands");
    };
    for (genre in profile.favoriteGenres.vals()) {
      switch (genre) {
        case (#other(text)) {
          if (text.size() > maxGenreTextLength) {
            Runtime.trap("Genre text is too long");
          };
        };
        case (_) {};
      };
    };
    for (band in profile.favoriteBands.vals()) {
      if (band.size() > maxBandNameLength) {
        Runtime.trap("Band name is too long");
      };
    };
    switch (profile.location) {
      case (?loc) {
        if (loc.size() > maxLocationLength) {
          Runtime.trap("Location is too long");
        };
      };
      case (null) {};
    };
    switch (profile.avatarUrl) {
      case (?url) {
        if (url.size() > maxAvatarUrlLength) {
          Runtime.trap("Avatar URL is too long");
        };
      };
      case (null) {};
    };
  };

  public shared ({ caller }) func verifyAgeAndCreateProfile(profile : UserProfile) : async () {
    checkRequestLimit(caller);

    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can verify age and create profiles");
    };

    if (userProfiles.containsKey(caller)) {
      Runtime.trap("Profile already exists");
    };

    if (not profile.isAgeVerified) {
      Runtime.trap("Age verification required");
    };

    validateProfile(profile);

    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    checkRequestLimit(caller);

    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    if (not isAgeVerified(caller)) {
      Runtime.trap("Unauthorized: Age verification required");
    };

    validateProfile(profile);

    let updatedProfile = { profile with isAgeVerified = true };
    userProfiles.add(caller, updatedProfile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func updateProfile(profile : UserProfile) : async () {
    checkRequestLimit(caller);

    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };

    if (not isAgeVerified(caller)) {
      Runtime.trap("Unauthorized: Age verification required");
    };

    validateProfile(profile);

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile does not exist") };
      case (?existingProfile) {
        let updatedProfile = { profile with isAgeVerified = existingProfile.isAgeVerified };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };

    if (not isAgeVerified(caller)) {
      Runtime.trap("Unauthorized: Age verification required");
    };

    // Block check: prevent viewing profiles of blocked users (bidirectional)
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      if (areUsersMutuallyBlockedInternal(caller, user)) {
        Runtime.trap("Cannot view profile: user is blocked");
      };
    };

    // Ownership check: can only view own profile unless admin
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };

    userProfiles.get(user);
  };

  public shared ({ caller }) func sendFriendRequest(to : Principal) : async () {
    checkRequestLimit(caller);

    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can send friend requests");
    };

    if (not isAgeVerified(caller)) {
      Runtime.trap("Unauthorized: Age verification required");
    };

    if (not isAgeVerified(to)) {
      Runtime.trap("Cannot send friend request to unverified user");
    };

    if (caller == to) {
      Runtime.trap("Cannot send friend request to yourself");
    };

    if (areUsersMutuallyBlockedInternal(caller, to)) {
      Runtime.trap("Cannot send friend request: user is blocked");
    };

    let request : FriendRequest = {
      from = caller;
      to;
      status = #pending;
      timestamp = Time.now();
    };

    let outgoingRequests = switch (friendRequests.get(caller)) {
      case (null) { List.empty<FriendRequest>() };
      case (?list) { list };
    };
    outgoingRequests.add(request);
    friendRequests.add(caller, outgoingRequests);

    let incomingRequests = switch (friendRequests.get(to)) {
      case (null) { List.empty<FriendRequest>() };
      case (?list) { list };
    };
    incomingRequests.add(request);
    friendRequests.add(to, incomingRequests);
  };

  public shared ({ caller }) func respondToFriendRequest(from : Principal, accept : Bool) : async () {
    checkRequestLimit(caller);

    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can respond to friend requests");
    };

    if (not isAgeVerified(caller)) {
      Runtime.trap("Unauthorized: Age verification required");
    };

    if (areUsersMutuallyBlockedInternal(caller, from)) {
      Runtime.trap("Cannot respond to friend request: user is blocked");
    };

    switch (friendRequests.get(caller)) {
      case (null) { Runtime.trap("No friend requests found") };
      case (?requestsList) {
        let updatedRequests = requestsList.toArray().map<FriendRequest, FriendRequest>(
          func(request : FriendRequest) {
            if (request.from == from and request.to == caller and request.status == #pending) {
              { request with status = if (accept) { #accepted } else { #rejected } };
            } else {
              request;
            };
          }
        );
        friendRequests.add(caller, List.fromArray<FriendRequest>(updatedRequests));

        if (accept) {
          let callerFriends = switch (friends.get(caller)) {
            case (null) { List.empty<Principal>() };
            case (?list) { list };
          };
          callerFriends.add(from);
          friends.add(caller, callerFriends);

          let fromFriends = switch (friends.get(from)) {
            case (null) { List.empty<Principal>() };
            case (?list) { list };
          };
          fromFriends.add(caller);
          friends.add(from, fromFriends);
        };
      };
    };
  };

  public query ({ caller }) func getFriends(user : Principal) : async [Principal] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view friends");
    };

    if (not isAgeVerified(caller)) {
      Runtime.trap("Unauthorized: Age verification required");
    };

    // Block check: prevent viewing friend list of blocked users
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      if (areUsersMutuallyBlockedInternal(caller, user)) {
        Runtime.trap("Cannot view friends: user is blocked");
      };
    };

    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own friends list");
    };

    switch (friends.get(user)) {
      case (null) { [] };
      case (?list) {
        list.toArray().filter(
          func(friend) {
            not areUsersMutuallyBlockedInternal(caller, friend);
          }
        );
      };
    };
  };

  public query ({ caller }) func getPendingRequests() : async [FriendRequest] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view friend requests");
    };

    if (not isAgeVerified(caller)) {
      Runtime.trap("Unauthorized: Age verification required");
    };

    switch (friendRequests.get(caller)) {
      case (null) { [] };
      case (?list) {
        list.toArray().filter<FriendRequest>(
          func(request) {
            (request.to == caller and request.status == #pending and not areUsersMutuallyBlockedInternal(caller, request.from));
          }
        );
      };
    };
  };

  public shared ({ caller }) func createPost(content : Text) : async Nat {
    checkRequestLimit(caller);

    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };

    if (not isAgeVerified(caller)) {
      Runtime.trap("Unauthorized: Age verification required");
    };

    if (content.size() == 0) {
      Runtime.trap("Content cannot be empty");
    };

    if (content.size() > maxPostContentLength) {
      Runtime.trap("Content is too long");
    };

    let postId = idCounter;
    idCounter += 1;

    let post : FeedPost = {
      id = postId;
      author = caller;
      content;
      timestamp = Time.now();
      likes = [];
    };

    feedPosts.add(postId, post);
    postId;
  };

  public shared ({ caller }) func likePost(postId : Nat) : async () {
    checkRequestLimit(caller);

    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };

    if (not isAgeVerified(caller)) {
      Runtime.trap("Unauthorized: Age verification required");
    };

    switch (feedPosts.get(postId)) {
      case (null) { Runtime.trap("Post does not exist") };
      case (?post) {
        if (areUsersMutuallyBlockedInternal(caller, post.author)) {
          Runtime.trap("Cannot like post: user is blocked");
        };

        let alreadyLiked = post.likes.find(
          func(p) { p == caller }
        );
        if (alreadyLiked != null) {
          Runtime.trap("Post already liked");
        };

        let updatedPost = {
          post with
          likes = post.likes.concat([caller]);
        };
        feedPosts.add(postId, updatedPost);
      };
    };
  };

  public query ({ caller }) func getFeed() : async [FeedPost] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view the feed");
    };

    if (not isAgeVerified(caller)) {
      Runtime.trap("Unauthorized: Age verification required");
    };

    let postsArray = feedPosts.values().toArray().filter(
      func(post) {
        not areUsersMutuallyBlockedInternal(caller, post.author);
      }
    );
    postsArray.sort<FeedPost>(FeedPost.compareByTimestamp);
  };

  public query ({ caller }) func getUserPosts(user : Principal) : async [FeedPost] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view posts");
    };

    if (not isAgeVerified(caller)) {
      Runtime.trap("Unauthorized: Age verification required");
    };

    if (areUsersMutuallyBlockedInternal(caller, user)) {
      Runtime.trap("Cannot view posts: user is blocked");
    };

    feedPosts.values().toArray().filter<FeedPost>(
      func(post) {
        post.author == user;
      }
    );
  };

  public shared ({ caller }) func deletePost(postId : Nat) : async () {
    checkRequestLimit(caller);

    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete posts");
    };

    if (not isAgeVerified(caller)) {
      Runtime.trap("Unauthorized: Age verification required");
    };

    switch (feedPosts.get(postId)) {
      case (null) { Runtime.trap("Post does not exist") };
      case (?post) {
        if (post.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own posts");
        };
        feedPosts.remove(postId);
      };
    };
  };

  public shared ({ caller }) func reportContent(reportedUser : ?Principal, reportedPost : ?Nat, reason : Text) : async () {
    checkRequestLimit(caller);

    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can report content");
    };

    if (not isAgeVerified(caller)) {
      Runtime.trap("Unauthorized: Age verification required");
    };

    if (reason.size() == 0) {
      Runtime.trap("Reason cannot be empty");
    };

    if (reason.size() > maxReasonLength) {
      Runtime.trap("Reason is too long");
    };

    if (reportedUser == null and reportedPost == null) {
      Runtime.trap("Must specify either a user or post to report");
    };

    let report : Report = {
      reporter = caller;
      reportedUser;
      reportedPost;
      reason;
      timestamp = Time.now();
    };

    let reportId = idCounter;
    idCounter += 1;

    let reportList = switch (reports.get(reportId)) {
      case (null) { List.empty<Report>() };
      case (?list) { list };
    };
    reportList.add(report);
    reports.add(reportId, reportList);
  };

  public query ({ caller }) func getReports() : async [(Nat, [Report])] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view reports");
    };

    let entriesArray = reports.entries().toArray();
    entriesArray.map<(Nat, List.List<Report>), (Nat, [Report])>(
      func((id, list)) { (id, list.toArray()) }
    );
  };

  public shared ({ caller }) func blockUser(target : Principal) : async () {
    checkRequestLimit(caller);

    if (caller == target) {
      Runtime.trap("You cannot block yourself");
    };

    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can block others");
    };

    if (not isAgeVerified(caller)) {
      Runtime.trap("Unauthorized: Age verification required");
    };

    let blockList = switch (userBlocks.get(caller)) {
      case (null) { List.empty<Principal>() };
      case (?list) { list };
    };

    let alreadyBlocked = blockList.any(
      func(b) { b == target }
    );
    if (alreadyBlocked) {
      Runtime.trap("User is already blocked");
    };

    let newBlock : Principal = target;
    blockList.add(newBlock);
    userBlocks.add(caller, blockList);

    switch (friendRequests.get(caller)) {
      case (null) {};
      case (?requestsList) {
        let updatedRequests = requestsList.toArray().filter(
          func(r) { r.to != target }
        );
        let filteredRequests = List.empty<FriendRequest>();
        for (request in updatedRequests.values()) {
          filteredRequests.add(request);
        };
        friendRequests.add(caller, filteredRequests);
      };
    };

    switch (friendRequests.get(target)) {
      case (null) {};
      case (?requestsList) {
        let updatedRequests = requestsList.toArray().filter(
          func(r) { r.from != caller }
        );
        let filteredRequests = List.empty<FriendRequest>();
        for (request in updatedRequests.values()) {
          filteredRequests.add(request);
        };
        friendRequests.add(target, filteredRequests);
      };
    };

    switch (friends.get(caller)) {
      case (null) {};
      case (?friendsList) {
        let updatedFriends = friendsList.toArray().filter(
          func(f) { f != target }
        );
        let filteredFriends = List.empty<Principal>();
        for (friend in updatedFriends.values()) {
          filteredFriends.add(friend);
        };
        friends.add(caller, filteredFriends);
      };
    };

    switch (friends.get(target)) {
      case (null) {};
      case (?friendsList) {
        let updatedFriends = friendsList.toArray().filter(
          func(f) { f != caller }
        );
        let filteredFriends = List.empty<Principal>();
        for (friend in updatedFriends.values()) {
          filteredFriends.add(friend);
        };
        friends.add(target, filteredFriends);
      };
    };
  };

  public shared ({ caller }) func unblockUser(target : Principal) : async () {
    checkRequestLimit(caller);

    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can unblock others");
    };

    if (not isAgeVerified(caller)) {
      Runtime.trap("Unauthorized: Age verification required");
    };

    let blockList = switch (userBlocks.get(caller)) {
      case (null) { List.empty<Principal>() };
      case (?list) { list };
    };

    let filteredBlocks = blockList.filter(
      func(block) { block != target }
    );
    userBlocks.add(caller, filteredBlocks);
  };

  public query ({ caller }) func getBlockedUsers() : async [Principal] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view their block list");
    };

    if (not isAgeVerified(caller)) {
      Runtime.trap("Unauthorized: Age verification required");
    };

    switch (userBlocks.get(caller)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  public query ({ caller }) func isUserBlocked(target : Principal) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can check block status");
    };

    if (not isAgeVerified(caller)) {
      Runtime.trap("Unauthorized: Age verification required");
    };

    isUserBlockedBy(caller, target);
  };

  public shared ({ caller }) func deleteOwnAccount() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete their accounts");
    };

    userProfiles.remove(caller);
    friendRequests.remove(caller);
    friends.remove(caller);
    userBlocks.remove(caller);

    let postsToDelete = feedPosts.values().toArray().filter(
      func(post) { post.author == caller }
    );
    for (post in postsToDelete.values()) {
      feedPosts.remove(post.id);
    };

    let reportsToDelete = reports.entries().toArray().filter(
      func((_, reportList)) {
        let reports = reportList.toArray();
        reports.size() > 0 and reports[0].reporter == caller;
      }
    );
    for ((reportId, _) in reportsToDelete.values()) {
      reports.remove(reportId);
    };

    let remainingRates = rateLimitMap.entries().toArray().filter(
      func((principal, _)) { principal != caller }
    );

    rateLimitMap.clear();
    for ((principal, entry) in remainingRates.values()) {
      rateLimitMap.add(principal, entry);
    };
  };
};
