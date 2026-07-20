"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"

// --- SYSTEM SETTINGS ---

export async function getSystemSettings() {
  try {
    let settings = await prisma.systemSettings.findUnique({
      where: { id: "global" }
    })
    
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: { id: "global", companyName: "GZL TEKSTİL" }
      })
    }
    
    return { success: true, data: settings }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateSystemSettings(data: any) {
  try {
    const updateData: any = {
      companyName: data.companyName,
      logoUrl: data.logoUrl,
      faviconUrl: data.faviconUrl
    }
    
    // Yalnızca gönderilmişse (veya undefined değilse) ekle
    if (data.systemStatus !== undefined) {
      updateData.systemStatus = data.systemStatus
    }

    const settings = await prisma.systemSettings.update({
      where: { id: "global" },
      data: updateData
    })
    revalidatePath("/", "layout") // revalidate everything to update header
    return { success: true, data: settings }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// --- USER MANAGEMENT ---

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
        // password is NOT selected for security
      }
    })
    return { success: true, data: users }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

import bcrypt from "bcryptjs"

export async function createUser(data: any) {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10)
    
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword
      }
    })
    revalidatePath("/ayarlar")
    return { success: true, data: user }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: "Bu e-posta adresi zaten kullanılıyor." }
    }
    return { success: false, error: error.message }
  }
}

export async function updateUser(id: string, data: any) {
  try {
    const updateData = { ...data }
    
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData
    })
    revalidatePath("/ayarlar")
    return { success: true, data: user }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id }
    })
    revalidatePath("/ayarlar")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
