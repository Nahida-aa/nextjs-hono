import { getApiDocs } from "~/app/(main)/docs/swagger";
import ReactSwagger from "./react-swagger";
import SwaggerUIHono from "./hono-doc";

export default async function IndexPage() {
  const spec = await getApiDocs();
  return (
    <section className="container">
      {/* <ReactSwagger spec={spec} /> */}
      <SwaggerUIHono />
    </section>
  );
}