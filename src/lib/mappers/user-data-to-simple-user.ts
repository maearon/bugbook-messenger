import { User as UserBetterAuth } from "@/lib/auth";
import { User } from "@/types/user";

export function mapBetterAuthUserToMongoUser(bu: UserBetterAuth): User {
  return {
    _id: bu.id, // Tạm thời dùng id BetterAuth
    username: bu.email.split("@")[0], // tạo username tạm
    email: bu.email,
    displayName: bu.name ?? bu.email,
    avatarUrl: bu.image ?? undefined,
    createdAt: bu.createdAt?.toString(),
    updatedAt: bu.updatedAt?.toString(),
  };
}