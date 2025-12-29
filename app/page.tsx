import { TileGrid } from '@/components/TileGrid';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-500">
      <div className="fixed top-0 left-0 w-full z-10 bg-gradient-to-b from-white/80 to-transparent dark:from-black/80 h-24 pointer-events-none" />
      
      <div className="pt-8 pb-20">
         <header className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-serif text-gray-900 dark:text-white mb-4 tracking-tighter">
              Eau de Paris
            </h1>
            <p className="text-xl text-gray-500 font-light italic">
              Une expérience sonore et visuelle
            </p>
         </header>

         <TileGrid />
      </div>

      <footer className="fixed bottom-0 w-full p-4 flex justify-center bg-gradient-to-t from-white dark:from-black to-transparent z-10">
        <Link
          href="/admin"
          className="text-xs text-gray-300 hover:text-gray-500 transition-colors uppercase tracking-widest"
        >
          Administration
        </Link>
      </footer>
    </main>
  );
}
