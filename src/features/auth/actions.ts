"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { createSession, deleteSession, getSessionUser } from "@/lib/session"

export async function loginUser(email: string, passwordAttempt: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return { success: false, error: "Kullanıcı bulunamadı." }
    }

    if (!user.isActive) {
      return { success: false, error: "Hesabınız pasif durumda. Lütfen yönetici ile iletişime geçin." }
    }

    const isValid = await bcrypt.compare(passwordAttempt, user.password)
    if (!isValid) {
      return { success: false, error: "Geçersiz şifre." }
    }

    // Başarılı girişte session oluştur
    await createSession(user.id)

    return { 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function logoutUser() {
  await deleteSession()
  return { success: true }
}

export async function getCurrentUser() {
  try {
    const user = await getSessionUser()
    if (!user) return { success: false }
    return { 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }
  } catch (error: any) {
    return { success: false }
  }
}
