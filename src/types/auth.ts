import type { UserProfile } from "@/types/user";

export type SessionUser = Pick<UserProfile, "id" | "name" | "email" | "image">;
