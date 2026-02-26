import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type BlobReference = Uint8Array;
export interface LinkData {
    id: bigint;
    url: string;
    logoReference: BlobReference;
    displayText: string;
    name: string;
    description: string;
}
export interface Profile__1 {
    principal: Principal;
    name: string;
    links: Array<LinkData>;
    entitlements: Array<EntitlementData>;
    additionalFields: Array<[string, string]>;
}
export interface Profile {
    name: string;
    role: UserRole;
}
export interface ProfileInput {
    name: string;
    links: Array<LinkData>;
    entitlements: Array<EntitlementData>;
    additionalFields: Array<[string, string]>;
}
export interface EntitlementData {
    id: bigint;
    files: Array<BlobReference>;
    logoReference?: BlobReference;
    documentReference?: string;
    properties: Array<[string, string]>;
    issuer: string;
    resourceName: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addLink(name: string, url: string, description: string, displayText: string, logoReference: BlobReference): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createEntitlement(resourceName: string, properties: Array<[string, string]>, issuer: string, documentReference: string | null, logoReference: BlobReference | null, files: Array<BlobReference>): Promise<bigint>;
    createProfile(data: ProfileInput): Promise<void>;
    deleteProfile(): Promise<void>;
    getCallerUserProfile(): Promise<Profile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEntitlements(principal: Principal): Promise<Array<EntitlementData>>;
    getLinks(principal: Principal): Promise<Array<LinkData>>;
    getProfile(principal: Principal): Promise<Profile__1>;
    getUserProfile(user: Principal): Promise<Profile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeEntitlement(entitlementId: bigint): Promise<void>;
    removeLink(linkId: bigint): Promise<void>;
    saveCallerUserProfile(profile: Profile): Promise<void>;
    updateProfile(data: ProfileInput): Promise<void>;
}
