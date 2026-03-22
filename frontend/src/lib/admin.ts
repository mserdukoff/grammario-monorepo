export const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID || ""

export function isAdmin(userId: string | undefined | null): boolean {
  return !!ADMIN_USER_ID && userId === ADMIN_USER_ID
}
