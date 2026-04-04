import type { Metadata } from 'next';
import AgentSignatureClient from './AgentSignatureClient';

export const metadata: Metadata = {
  title: '電子署名 | Ledra',
  description: '代理店契約書の内容を確認し、電子署名を行ってください。',
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function AgentSignaturePage({ params }: PageProps) {
  const { token } = await params;
  return <AgentSignatureClient token={token} />;
}
