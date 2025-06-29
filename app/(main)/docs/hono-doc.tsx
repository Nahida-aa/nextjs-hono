'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

const SwaggerUIHono = () => {
  return <SwaggerUI url="/api/hono/doc" />;
};

export default SwaggerUIHono;