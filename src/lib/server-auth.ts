import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

export async function getRequiredSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function getRequiredUserId() {
  const session = await getRequiredSession();
  if (!session.user.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}
