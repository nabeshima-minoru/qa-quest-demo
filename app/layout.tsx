import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QA Quest — テスター育成シミュレーション',
  description: 'JSTQB と現場感を組み込んだテスター育成ゲームの社内デモ版',
};

const COPYRIGHT_YEAR = new Date().getFullYear();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <div className="pb-10">{children}</div>
        <footer className="qa-copyright pointer-events-none fixed bottom-0 left-0 right-0 z-40 text-center px-4 py-2 mono text-[10px] tracking-widest uppercase">
          <span className="opacity-60">
            © {COPYRIGHT_YEAR} QA Quest · Internal Demo · All Rights Reserved
          </span>
        </footer>
      </body>
    </html>
  );
}
