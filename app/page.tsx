import PoemThread from '@/components/PoemThread';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black relative overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
      >
        <source src="/hvn_bg.mp4" type="video/mp4" />
      </video>

      {/* Overlay for readability */}
      <div className="fixed inset-0 video-overlay backdrop-blur-[1px] z-[1]" />

      {/* Content */}
      <div className="relative z-10">
        <PoemThread />
      </div>
    </main>
  );
}
