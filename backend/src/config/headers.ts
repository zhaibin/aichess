// HTTP Headers配置

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
} as const;

export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' wss: https:; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';"
} as const;

export const getResponseHeaders = (contentType: string, cacheControl?: string) => ({
  'Content-Type': contentType,
  ...(cacheControl ? { 'Cache-Control': cacheControl } : {}),
  ...CORS_HEADERS,
  ...SECURITY_HEADERS
});

