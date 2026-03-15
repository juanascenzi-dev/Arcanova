import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-brand-light text-brand-navy">
      <div className="w-16 h-16 rounded bg-brand-gold flex items-center justify-center text-white mb-8 text-2xl">
        ✦
      </div>
      <h1 className="text-6xl font-display font-bold mb-4">404</h1>
      <p className="text-xl mb-8 opacity-70">The page you're looking for doesn't exist.</p>
      <Link href="/" className="px-6 py-3 bg-brand-navy text-white rounded-lg hover:bg-brand-gold transition-colors">
        Return Home
      </Link>
    </div>
  );
}
