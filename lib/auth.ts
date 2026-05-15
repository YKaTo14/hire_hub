import jwt from 'jsonwebtoken'

export interface JWTPayload {
  id: number
  email: string
  role: string
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

export function extractToken(req: Request): string | null {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

export function requireAuth(req: Request): JWTPayload {
  const token = extractToken(req)
  if (!token) {
    throw new Error('Unauthorized')
  }

  const payload = verifyToken(token)
  if (!payload) {
    throw new Error('Invalid token')
  }

  return payload
}

export function requireRole(allowedRoles: string[]) {
  return (req: Request): JWTPayload => {
    const payload = requireAuth(req)
    if (!allowedRoles.includes(payload.role)) {
      throw new Error('Forbidden')
    }
    return payload
  }
}
