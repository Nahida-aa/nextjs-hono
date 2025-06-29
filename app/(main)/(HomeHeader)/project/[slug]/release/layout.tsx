import { SelectedFileProvider } from './_comp/selectedFile-context';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SelectedFileProvider> 
      {children}
    </SelectedFileProvider>
  );
}
