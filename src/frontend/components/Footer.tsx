import React from 'react';
import { Heart, Github, Shield, FileText, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/10 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Copyright & Made with Love */}
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span>© {currentYear} Streamify</span>
            <span className="hidden md:inline">•</span>
            <span className="flex items-center gap-1">
              Made with <Heart size={14} className="text-red-400 animate-pulse" /> for music lovers
            </span>
          </div>

          {/* Center: Legal Links */}
          <div className="flex items-center gap-4 text-sm">
            <Link
              to="/terms"
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <FileText size={14} />
              <span>Terms</span>
            </Link>
            <Link
              to="/privacy"
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <Shield size={14} />
              <span>Privacy</span>
            </Link>
            <Link
              to="/credits"
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <Users size={14} />
              <span>Credits</span>
            </Link>
          </div>

          {/* Right: GitHub Link & Version */}
          <div className="flex items-center gap-3 text-sm">
            <a
              href="https://github.com/yourusername/streamify"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <Github size={16} />
              <span className="hidden md:inline">Open Source</span>
            </a>
            <span className="hidden md:inline text-gray-600">•</span>
            <span className="text-gray-600 text-xs hidden md:inline">v2.0.0</span>
          </div>
        </div>

        {/* Educational Notice (Mobile) */}
        <div className="mt-2 text-center md:hidden">
          <p className="text-xs text-gray-600">Educational use only • Not affiliated with any music service</p>
        </div>
      </div>
    </footer>
  );
};
