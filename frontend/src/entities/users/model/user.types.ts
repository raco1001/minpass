export type User = {
  id: string
  email: string
  name?: string
  roles?: string[]
  accessToken?: string
  isNewUser?: boolean
}