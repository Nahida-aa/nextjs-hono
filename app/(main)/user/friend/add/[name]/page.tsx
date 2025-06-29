import { SubHeader } from "~/components/layout/header/sub-header"
import { ClientMain } from "./_comp/client-main";

export default async function AddFriendByNamePage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const name = (await params).name
  const decodeURLComponentName = decodeURIComponent(name)
  return <main className="h-full">
    <SubHeader 
      className='sticky top-0 z-10' > 
      Add friend 
    </SubHeader>
    <section className="bg-card/80 h-full px-4">
      <ClientMain name={decodeURLComponentName} />
    </section>
  </main>
}