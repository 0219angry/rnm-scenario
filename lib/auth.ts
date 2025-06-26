"use server";

import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("sessionToken")?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await prisma.userSession.findUnique({
    where: { sessionToken },
    include: { user: true },
  });

  if (!session || session.expires < new Date()) {
    return null;
  }

  return session.user;
}

export async function logout() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("sessionToken")?.value;
  if (sessionToken) {
    await prisma.userSession.deleteMany({
      where: { sessionToken },
    });
    cookieStore.delete("sessionToken");
  }
  redirect("/");
}
