const spec = {
  openapi: '3.0.3',
  info: {
    title: 'HireHub API',
    version: '1.0.0',
    description: 'OpenAPI specification for HireHub core endpoints'
  },
  servers: [{ url: 'http://localhost:3001' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  paths: {
    '/api/auth/register': {
      post: { summary: 'Register user' }
    },
    '/api/auth/login': {
      post: { summary: 'Login user and return JWT' }
    },
    '/api/jobs': {
      get: { summary: 'List jobs' },
      post: { summary: 'Create job', security: [{ bearerAuth: [] }] }
    },
    '/api/applications': {
      get: { summary: 'List applications', security: [{ bearerAuth: [] }] },
      post: { summary: 'Create application', security: [{ bearerAuth: [] }] }
    },
    '/api/cv': {
      get: { summary: 'List current user CVs', security: [{ bearerAuth: [] }] },
      post: { summary: 'Create CV', security: [{ bearerAuth: [] }] }
    },
    '/api/cv/{id}': {
      put: { summary: 'Update CV', security: [{ bearerAuth: [] }] },
      delete: { summary: 'Delete CV', security: [{ bearerAuth: [] }] }
    },
    '/api/interviews': {
      get: { summary: 'List interviews', security: [{ bearerAuth: [] }] },
      post: { summary: 'Schedule interview', security: [{ bearerAuth: [] }] }
    },
    '/api/interviews/{id}': {
      put: { summary: 'Update interview', security: [{ bearerAuth: [] }] },
      delete: { summary: 'Delete interview', security: [{ bearerAuth: [] }] }
    },
    '/api/agent/recommend': {
      post: { summary: 'Get AI job recommendations', security: [{ bearerAuth: [] }] }
    },
    '/api/agent/auto-apply': {
      post: { summary: 'Run auto-apply agent', security: [{ bearerAuth: [] }] }
    }
  }
}

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  return Response.json(spec)
}
