export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <> 
      <div className="h-12"></div>
      {children}
    </>
  );
}
