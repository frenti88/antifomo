import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <span className="text-6xl opacity-20 mb-6 text-text" aria-hidden="true">◎</span>
      <h1 className="text-3xl font-bold mb-4 text-text">Página no encontrada</h1>
      <p className="text-lg text-secondary mb-8 max-w-md mx-auto">
        Esta página no existe o fue movida.
      </p>
      <Link 
        href="/" 
        className="bg-accent text-black px-8 py-4 rounded-full font-bold hover:bg-opacity-90 transition-colors inline-block"
      >
        Volver al radar
      </Link>
    </main>
  );
}
