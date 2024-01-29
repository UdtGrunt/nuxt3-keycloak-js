interface JwtDecoded {
  email: string
  email_verified: boolean
  auth_time: number
  exp: number
  iat: number
  jti: string
  realm_access: RealmAccess
  scope: string
  session_state: string
  sid: string
  sub: string
  typ: string
}

interface RealmAccess {
  roles: string[]
}