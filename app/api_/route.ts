import { ApiReference } from '@scalar/nextjs-api-reference'

const config = {
  spec: {
    url: '/api/doc',
  },
}

export const GET = ApiReference(config)