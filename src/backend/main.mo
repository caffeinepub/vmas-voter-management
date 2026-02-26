import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  include MixinStorage();

  // Alias types for clarity
  public type BlobReference = Storage.ExternalBlob;

  // Entitlements
  public type EntitlementData = {
    id : Nat;
    resourceName : Text;
    properties : [(Text, Text)];
    issuer : Text;
    documentReference : ?Text;
    logoReference : ?BlobReference;
    files : [BlobReference];
  };

  // Links
  public type LinkData = {
    id : Nat;
    name : Text;
    url : Text;
    description : Text;
    displayText : Text;
    logoReference : BlobReference;
  };

  // Profiles
  public type Profile = {
    name : Text;
    principal : Principal;
    entitlements : [EntitlementData];
    additionalFields : [(Text, Text)];
    links : [LinkData];
  };

  public type ProfileInput = {
    name : Text;
    entitlements : [EntitlementData];
    additionalFields : [(Text, Text)];
    links : [LinkData];
  };

  // State variables
  let profiles = Map.empty<Principal, Profile>();
  var nextLinkId = 0;
  var nextEntitlementId = 0;

  // User Profile Management (Required by frontend)
  type UserRole = {
    #admin;
    #user;
    #guest;
  };

  module User {
    public type Profile = {
      name : Text;
      role : UserRole;
    };
  };

  let userProfiles = Map.empty<Principal, User.Profile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getCallerUserProfile() : async ?User.Profile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?User.Profile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : User.Profile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Profile management
  public shared ({ caller }) func createProfile(data : ProfileInput) : async () {
    let newProfile : Profile = {
      name = data.name;
      principal = caller;
      entitlements = data.entitlements;
      additionalFields = data.additionalFields;
      links = data.links;
    };
    profiles.add(caller, newProfile);
  };

  public query ({ caller }) func getProfile(principal : Principal) : async Profile {
    switch (profiles.get(principal)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Profile not found") };
    };
  };

  public shared ({ caller }) func updateProfile(data : ProfileInput) : async () {
    switch (profiles.get(caller)) {
      case (?existing) {
        let updatedProfile : Profile = {
          name = data.name;
          principal = caller;
          entitlements = data.entitlements;
          additionalFields = data.additionalFields;
          links = data.links;
        };
        profiles.add(caller, updatedProfile);
      };
      case (null) { Runtime.trap("Profile not found") };
    };
  };

  public shared ({ caller }) func deleteProfile() : async () {
    profiles.remove(caller);
  };

  // Link management
  public shared ({ caller }) func addLink(
    name : Text,
    url : Text,
    description : Text,
    displayText : Text,
    logoReference : BlobReference,
  ) : async Nat {
    let newLink : LinkData = {
      id = nextLinkId;
      name;
      url;
      description;
      displayText;
      logoReference;
    };
    nextLinkId += 1;
    newLink.id;
  };

  public shared ({ caller }) func removeLink(linkId : Nat) : async () {
    switch (profiles.get(caller)) {
      case (?profile) {
        let updatedLinks = List.fromArray<LinkData>(profile.links).filter(
          func(link) { link.id != linkId }
        );
        let updatedProfile : Profile = {
          name = profile.name;
          principal = profile.principal;
          entitlements = profile.entitlements;
          additionalFields = profile.additionalFields;
          links = updatedLinks.toArray();
        };
        profiles.add(caller, updatedProfile);
      };
      case (null) { Runtime.trap("Profile not found") };
    };
  };

  public query ({ caller }) func getLinks(principal : Principal) : async [LinkData] {
    switch (profiles.get(principal)) {
      case (?profile) { profile.links };
      case (null) { [] };
    };
  };

  // Entitlement management
  public shared ({ caller }) func createEntitlement(
    resourceName : Text,
    properties : [(Text, Text)],
    issuer : Text,
    documentReference : ?Text,
    logoReference : ?BlobReference,
    files : [BlobReference],
  ) : async Nat {
    let newEntitlement : EntitlementData = {
      id = nextEntitlementId;
      resourceName;
      properties;
      issuer;
      documentReference;
      logoReference;
      files;
    };
    nextEntitlementId += 1;
    newEntitlement.id;
  };

  public shared ({ caller }) func removeEntitlement(entitlementId : Nat) : async () {
    switch (profiles.get(caller)) {
      case (?profile) {
        let updatedEntitlements = List.fromArray<EntitlementData>(profile.entitlements).filter(
          func(entitlement) { entitlement.id != entitlementId }
        );
        let updatedProfile : Profile = {
          name = profile.name;
          principal = profile.principal;
          entitlements = updatedEntitlements.toArray();
          additionalFields = profile.additionalFields;
          links = profile.links;
        };
        profiles.add(caller, updatedProfile);
      };
      case (null) { Runtime.trap("Profile not found") };
    };
  };

  public query ({ caller }) func getEntitlements(principal : Principal) : async [EntitlementData] {
    switch (profiles.get(principal)) {
      case (?profile) { profile.entitlements };
      case (null) { [] };
    };
  };
};
