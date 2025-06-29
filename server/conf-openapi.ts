import { AppOpenAPI } from "./types";
import packageJson from '~/../package.json'
import { apiReference } from '@scalar/hono-api-reference'

export default function configOpenAPI(app: AppOpenAPI) {
  app.doc31('/doc', (c) => ({
    openapi: '3.1.0',
    info: {
      title: 'Hono API',
      version: packageJson.version,
      description: `- [去swagger-ui](/docs)\n- [去scalar-ui](/api/hono)\n- [index](/)
      `,
    },
    servers: [
      {
        url: new URL(c.req.url).origin,
        description: `- 不要使用这个认证, 因为这个认证 默认调用的 /api/auth/token, 我没有实现这个接口, 请去 /api/auth/login 测试登录, 或 /api/auth/register 测试注册, 都会得到一样的效果`,
      },
    ],
    paths: {},
  }));
  app.openAPIRegistry.registerComponent('securitySchemes', 'SessionToken', {
    type: "apiKey",
    in: "cookie",
    name: "session_token",
  });
  app.openAPIRegistry.registerComponent('securitySchemes', 'OAuth2PasswordBearer', {
    type: "oauth2",
    flows: {
      password: {
        scopes: {
          read_user: "read user",
          write_self: "write user self",
        },
        tokenUrl: "/api/auth/token",
      },
    },
  });
  app.openAPIRegistry.registerComponent('securitySchemes', 'BearerAuth', {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  });
  app.openAPIRegistry.registerComponent('securitySchemes', 'CSRF', {
    type: "apiKey",
    in: "cookie",
    name: "csrf_token",
  });
  app.get('/', 
    apiReference({
      theme: 'kepler',
      layout: 'modern',
      defaultHttpClient: {
        targetKey: 'javascript',
        clientKey: 'fetch',
      },
      spec: {
        url: '/api/hono/doc',
      },
    })
  );
}