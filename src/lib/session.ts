import { cookies } from "next/headers"
import prisma from "./prisma"

// Creates a session in DB and sets the HttpOnly cookie
export async function createSession(userId: string) {
  // Session expires in 7 days
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  // 1. Create a session in the database
  const session = await prisma.session.create({
    data: {
      userId,
      expiresAt,
    },
  })

  // 2. Set the cookie
  const cookieStore = await cookies()
  cookieStore.set("session", session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  })

  return session
}

// Clears the session cookie and removes it from DB
export async function deleteSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session")?.value

  if (sessionId) {
    try {
      await prisma.session.delete({
        where: { id: sessionId }
      })
    } catch (e) {
      // Ignore if it doesn't exist
    }
  }

  cookieStore.delete("session")
}

// Gets the current user from the session cookie
export async function getSessionUser() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session")?.value

  if (!sessionId) return null

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true }
  })

  // If session doesn't exist or is expired, clear it
  if (!session || session.expiresAt < new Date()) {
    cookieStore.delete("session")
    if (session) {
      try {
        await prisma.session.delete({ where: { id: session.id } })
      } catch (e) {}
    }
    return null
  }

  // Session is valid
  return session.user
}
