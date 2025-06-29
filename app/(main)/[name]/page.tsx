import { SubHeader } from "~/components/layout/header/sub-header"

export default async function Page({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const name = (await params).name
  const decodeURLComponentName = decodeURIComponent(name)

  return <main className="z-[100] h-full">
    <SubHeader 
      user={undefined}
      className='sticky top-0 z-10' > 
      profile
    </SubHeader>
    <span>
      My Name: {name} 
    </span>
    <br />
    <span>
      My Decoded Name: {decodeURLComponentName}
    </span>
  </main>
}