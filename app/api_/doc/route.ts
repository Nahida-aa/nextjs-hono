import { getApiDocs } from '~/app/(main)/docs/swagger';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(req: NextRequest) {

  const openapi_doc = await getApiDocs();
  return NextResponse.json(openapi_doc);
}
