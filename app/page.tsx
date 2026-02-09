import PoemThread from '@/components/PoemThread';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <PoemThread />
    </main>
  );
}
