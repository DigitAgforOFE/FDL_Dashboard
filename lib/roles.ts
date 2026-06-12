export type Role = "admin" | "member" | "viewer"

export function isAdmin(role: Role): boolean {
  return role === "admin"
}

export function canCreate(role: Role): boolean {
  return role !== "viewer"
}

export function canEdit(role: Role): boolean {
  return role !== "viewer"
}

export function canDelete(role: Role, editMode: boolean): boolean {
  return (role === "admin" || role === "member") && editMode
}
