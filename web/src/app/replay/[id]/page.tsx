import ReplayPageClient from './ReplayPageClient';

export async function generateStaticParams() {
  return [{ id: 'latest' }];
}

export const dynamicParams = true;

export default function Page({ params }: { params: { id: string } }) {
  return <ReplayPageClient params={params} />;
}
