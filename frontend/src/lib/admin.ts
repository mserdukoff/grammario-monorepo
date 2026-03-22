export const ADMIN_USER_ID = "3f5a9d50-d8fb-4e05-a7c7-52b79d1aeee5"
export const ADMIN_EMAIL = "m.serdukoff@gmail.com"

export function isAdmin(userId: string | undefined | null): boolean {
  return userId === ADMIN_USER_ID
}
