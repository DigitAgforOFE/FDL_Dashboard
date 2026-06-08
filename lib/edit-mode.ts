import { prisma } from "@/lib/prisma"

export async function getEditMode(): Promise<boolean> {
  try {
    const row = await prisma.siteConfig.findUnique({ where: { key: "edit_mode" } })
    return row?.value === "true"
  } catch {
    return false
  }
}

export async function setEditMode(enabled: boolean): Promise<void> {
  await prisma.siteConfig.upsert({
    where: { key: "edit_mode" },
    update: { value: String(enabled) },
    create: { key: "edit_mode", value: String(enabled) },
  })
}
