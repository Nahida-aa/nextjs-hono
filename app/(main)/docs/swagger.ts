import oneOf from "~/lib/openapi/helpers/one-of";
import { desc } from "drizzle-orm";
import { createSwaggerSpec } from "next-swagger-doc";

const UuidCommonProperties = {
  id: {
    type: "string",
    format: "uuid",
  },
  name: {
    type: "string",
  },
  description: {
    type: "string",
    default: "",
  },
  updated_at: {
    oneOf: [
      {
        type: "string",
        format: "date-time",
      },
      {
        type: "null",
      },
    ],
  },
  created_at: {
    type: "string",
    format: "date-time",
  },
}

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: "src/app/api", // define api folder under app folder
    definition: {
      openapi: "3.1.1",
      info: {
        title: "Mcc API",
        version: "1.0",
      },
      components: {
        securitySchemes: {
          OAuth2PasswordBearer: {
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
          },
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
        schemas: {
          UuidCommon: {
            properties: UuidCommonProperties,
            type: "object",
          },
          UserPublic: {
            properties: {
              ...UuidCommonProperties,
              image: {
                oneOf: [{ type: "string" }, { type: "null" }],
              },
              nickname: {
                oneOf: [{ type: "string" }, { type: "null" }],
              },
              email: {
                oneOf: [{ type: "string" }, { type: "null" }],
              },
            },
            type: "object",
          }
        }
      },
      security: [],
    },
  });
  return spec;
}