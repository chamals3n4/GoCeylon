import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-8 py-6 flex items-center justify-between gap-4">
        <Link to="/" className="text-sm font-bold text-gray-400 tracking-tight hover:text-gray-200 transition-colors">
          GoCeylon
        </Link>
        <p className="text-xs text-gray-600">© 2025 GoCeylon. All rights reserved.</p>
      </div>
    </footer>
  );
}
