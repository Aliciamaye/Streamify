import React from 'react';
import { ArrowLeft, Heart, Code, Package, Globe, Github } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Credits: React.FC = () => {
  const navigate = useNavigate();

  const openSourceLibraries = [
    { name: 'React', description: 'UI framework', license: 'MIT', url: 'https://reactjs.org' },
    { name: 'TypeScript', description: 'Type-safe JavaScript', license: 'Apache-2.0', url: 'https://www.typescriptlang.org' },
    { name: 'Vite', description: 'Build tool', license: 'MIT', url: 'https://vitejs.dev' },
    { name: 'Tailwind CSS', description: 'Utility-first CSS', license: 'MIT', url: 'https://tailwindcss.com' },
    { name: 'Express', description: 'Backend framework', license: 'MIT', url: 'https://expressjs.com' },
    { name: 'Node.js', description: 'JavaScript runtime', license: 'MIT', url: 'https://nodejs.org' },
    { name: 'Electron', description: 'Desktop app framework', license: 'MIT', url: 'https://www.electronjs.org' },
    { name: 'SQLite', description: 'Embedded database', license: 'Public Domain', url: 'https://www.sqlite.org' },
    { name: 'Lucide React', description: 'Icon library', license: 'ISC', url: 'https://lucide.dev' },
    { name: 'Axios', description: 'HTTP client', license: 'MIT', url: 'https://axios-http.com' },
    { name: 'jsonwebtoken', description: 'JWT implementation', license: 'MIT', url: 'https://github.com/auth0/node-jsonwebtoken' },
    { name: 'bcrypt', description: 'Password hashing', license: 'MIT', url: 'https://github.com/kelektiv/node.bcrypt.js' },
    { name: 'dotenv', description: 'Environment variables', license: 'BSD-2-Clause', url: 'https://github.com/motdotla/dotenv' },
    { name: 'cors', description: 'CORS middleware', license: 'MIT', url: 'https://github.com/expressjs/cors' },
    { name: 'uuid', description: 'UUID generator', license: 'MIT', url: 'https://github.com/uuidjs/uuid' },
  ];

  const apiServices = [
    { name: 'Spotify Web API', description: 'Playlist integration', url: 'https://developer.spotify.com' },
    { name: 'Apple Music API', description: 'MusicKit integration', url: 'https://developer.apple.com/musickit' },
    { name: 'Last.fm API', description: 'Scrobbling & stats', url: 'https://www.last.fm/api' },
    { name: 'Discord Webhooks', description: 'Rich presence & sharing', url: 'https://discord.com/developers' },
  ];

  const inspiration = [
    { name: 'SimplMusic', description: 'Desktop music player inspiration', url: 'https://github.com/maxrave-dev/SimpMusic' },
    { name: 'YouTube Music Desktop', description: 'UI/UX patterns', url: 'https://github.com/th-ch/youtube-music' },
    { name: 'Nuclear', description: 'Music aggregation concepts', url: 'https://nuclear.js.org' },
    { name: 'Spot', description: 'Clean interface design', url: 'https://github.com/xou816/spot' },
  ];

  return (
    <div className="min-h-screen pb-32 pt-8 px-8 overflow-y-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-pink-600 to-purple-600 p-4 rounded-full">
            <Heart className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Credits & Attributions</h1>
            <p className="text-gray-400">Built with love using open source technology</p>
          </div>
        </div>

        {/* Made With Love */}
        <div className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 border border-pink-500/30 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <Code size={20} className="text-pink-400" />
            About This Project
          </h2>
          <p className="text-gray-300 leading-relaxed mb-3">
            Streamify is an <strong>educational project</strong> created to demonstrate modern web technologies,
            desktop application development, and music service integrations. It is open source and free to use.
          </p>
          <p className="text-gray-300 leading-relaxed">
            This project would not be possible without the amazing open source community and the incredible
            libraries, frameworks, and APIs listed below.
          </p>
        </div>

        {/* Open Source Libraries */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Package size={24} className="text-blue-400" />
            Open Source Libraries
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {openSourceLibraries.map((lib) => (
              <a
                key={lib.name}
                href={lib.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {lib.name}
                  </h3>
                  <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded">{lib.license}</span>
                </div>
                <p className="text-sm text-gray-400">{lib.description}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Third-Party APIs */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Globe size={24} className="text-green-400" />
            Third-Party Services
          </h2>
          <p className="text-gray-400 mb-4">
            Streamify integrates with these amazing music services. We are not affiliated with or endorsed by any of them.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apiServices.map((service) => (
              <a
                key={service.name}
                href={service.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 transition-all group"
              >
                <h3 className="text-lg font-semibold text-white group-hover:text-green-400 transition-colors mb-2">
                  {service.name}
                </h3>
                <p className="text-sm text-gray-400">{service.description}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Inspiration */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Heart size={24} className="text-red-400" />
            Inspiration & Similar Projects
          </h2>
          <p className="text-gray-400 mb-4">
            These awesome projects inspired Streamify's design and features:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inspiration.map((project) => (
              <a
                key={project.name}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 transition-all group"
              >
                <h3 className="text-lg font-semibold text-white group-hover:text-red-400 transition-colors mb-2">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-400">{project.description}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-amber-400 mb-3">Disclaimer</h2>
          <div className="text-gray-300 space-y-2">
            <p>
              <strong>Not Affiliated:</strong> Streamify is not affiliated with, endorsed by, or sponsored by
              Spotify, Apple Music, Last.fm, Discord, Google, YouTube, or any other music service or platform.
            </p>
            <p>
              <strong>Trademarks:</strong> All product names, logos, and brands are property of their respective owners.
              All company, product, and service names used in this application are for identification purposes only.
            </p>
            <p>
              <strong>Educational Use:</strong> This project is created for educational purposes to demonstrate
              software development techniques. It is not intended for commercial use.
            </p>
          </div>
        </div>

        {/* Contributors */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Github size={24} className="text-purple-400" />
            Contributors
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            This project is open source and welcomes contributions from the community. Special thanks to everyone
            who has contributed code, reported bugs, or provided feedback.
          </p>
          <a
            href="https://github.com/yourusername/streamify"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all"
          >
            <Github size={20} />
            View on GitHub
          </a>
        </div>

        {/* License */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">License</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Streamify is released under the <strong>MIT License</strong>. You are free to use, modify, and
            distribute this software for personal and educational purposes.
          </p>
          <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-gray-400">
            <p>MIT License</p>
            <p className="mt-2">Copyright (c) 2026 Streamify Contributors</p>
            <p className="mt-2">
              Permission is hereby granted, free of charge, to any person obtaining a copy of this software
              and associated documentation files (the "Software"), to deal in the Software without restriction...
            </p>
          </div>
        </div>

        {/* Thank You */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-8 text-center">
          <Heart size={48} className="text-pink-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-3">Thank You!</h2>
          <p className="text-gray-300 leading-relaxed max-w-2xl mx-auto">
            To the open source community, the developers of the amazing tools we use, and everyone who believes
            in free and accessible software - thank you for making projects like this possible.
          </p>
        </div>
      </div>
    </div>
  );
};
