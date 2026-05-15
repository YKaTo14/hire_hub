// Security headers middleware
export function setSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers)
  
  // Prevent clickjacking
  headers.set('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff')
  
  // Enable XSS protection
  headers.set('X-XSS-Protection', '1; mode=block')
  
  // Referrer policy
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Content Security Policy (basic)
  headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'"
  )
  
  // HSTS (only in production with HTTPS)
  if (process.env.NODE_ENV === 'production') {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}

// Input sanitization helpers
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .substring(0, 1000) // Limit length
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().substring(0, 255)
}

// SQL injection prevention helpers
export function escapeSqlLike(input: string): string {
  return input.replace(/[%_\\]/g, '\\$&')
}
