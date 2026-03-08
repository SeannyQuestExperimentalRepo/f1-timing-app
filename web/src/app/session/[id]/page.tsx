import SessionPageClient from './SessionPageClient';

export async function generateStaticParams() {
  return [{ id: 'latest' }];
}

export const dynamicParams = true;

export default function Page({ params }: { params: { id: string } }) {
  return <SessionPageClient params={params} />;
}
