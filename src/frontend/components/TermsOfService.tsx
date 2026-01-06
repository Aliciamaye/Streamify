import React from 'react';
import { ArrowLeft, Scale, Shield, Users, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TermsOfService: React.FC = () => {
  const navigate = useNavigate();

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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-full">
            <Scale className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
            <p className="text-gray-400">Last updated: January 6, 2026</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-8">
          {/* Important Notice */}
          <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-lg p-6">
            <h2 className="text-xl font-bold text-amber-400 mb-3 flex items-center gap-2">
              <Shield size={20} />
              Important Notice
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Streamify is provided for <strong>educational and personal use only</strong>. This application
              is not affiliated with, endorsed by, or sponsored by any music streaming service or content provider.
              Users are responsible for ensuring their use complies with all applicable laws and terms of service
              of third-party platforms.
            </p>
          </div>

          {/* 1. Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              By downloading, installing, or using Streamify, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, do not use this application.
            </p>
          </section>

          {/* 2. Description of Service */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              Streamify is a desktop music streaming application that:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Aggregates music content from publicly available sources</li>
              <li>Integrates with third-party music services (Spotify, Apple Music, Last.fm, Discord)</li>
              <li>Provides a unified interface for music playback and management</li>
              <li>Stores user preferences and data locally on your device</li>
            </ul>
          </section>

          {/* 3. User Responsibilities */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. User Responsibilities</h2>
            <p className="text-gray-300 leading-relaxed mb-3">You agree to:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Use Streamify for personal, non-commercial purposes only</li>
              <li>Provide your own API credentials for third-party integrations</li>
              <li>Comply with the terms of service of all integrated platforms</li>
              <li>Not redistribute, modify, or reverse-engineer the application</li>
              <li>Not use the application for illegal purposes or copyright infringement</li>
              <li>Not circumvent any access restrictions or security measures</li>
            </ul>
          </section>

          {/* 4. Third-Party Services */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Third-Party Services</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              Streamify integrates with third-party services including Spotify, Apple Music, Last.fm, and Discord.
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>You must create your own accounts with these services</li>
              <li>You are bound by their respective terms of service</li>
              <li>Streamify is not responsible for changes to third-party APIs</li>
              <li>Integration features may stop working without notice</li>
              <li>Your data with third-party services is governed by their privacy policies</li>
            </ul>
          </section>

          {/* 5. Content and Copyright */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Content and Copyright</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              <strong>Streamify does not host, store, or distribute copyrighted content.</strong> All music
              content is streamed from publicly available sources. Users are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Ensuring they have the right to access streamed content</li>
              <li>Complying with copyright laws in their jurisdiction</li>
              <li>Obtaining appropriate licenses for commercial use</li>
              <li>Not using Streamify to infringe on intellectual property rights</li>
            </ul>
          </section>

          {/* 6. Data and Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Data and Privacy</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              Streamify is a desktop application that stores all data locally:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>No user data is sent to Streamify servers (we don't have any)</li>
              <li>Your playlists, history, and preferences are stored on your device</li>
              <li>Integration credentials are stored locally and encrypted</li>
              <li>We do not collect analytics, telemetry, or usage data</li>
              <li>See our <a href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</a> for details</li>
            </ul>
          </section>

          {/* 7. Disclaimer of Warranties */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Disclaimer of Warranties</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              STREAMIFY IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
              LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>We do not guarantee uninterrupted or error-free service</li>
              <li>We are not responsible for content availability or quality</li>
              <li>We do not warrant that the application is free of viruses or harmful components</li>
              <li>Use at your own risk</li>
            </ul>
          </section>

          {/* 8. Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-300 leading-relaxed">
              IN NO EVENT SHALL THE DEVELOPERS OF STREAMIFY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
              CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE,
              GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF OR INABILITY TO
              ACCESS OR USE THE APPLICATION.
            </p>
          </section>

          {/* 9. Open Source */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Open Source Software</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              Streamify is built using open source software. See our <a href="/credits" className="text-blue-400 hover:underline">Credits</a> page
              for a full list of dependencies and their licenses.
            </p>
          </section>

          {/* 10. Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Changes to Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to modify these terms at any time. Continued use of Streamify after changes
              constitutes acceptance of the modified terms. Check this page periodically for updates.
            </p>
          </section>

          {/* 11. Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Governing Law</h2>
            <p className="text-gray-300 leading-relaxed">
              These terms shall be governed by and construed in accordance with the laws of your local jurisdiction,
              without regard to its conflict of law provisions.
            </p>
          </section>

          {/* 12. Contact */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Contact</h2>
            <p className="text-gray-300 leading-relaxed">
              For questions about these Terms of Service, please visit our{' '}
              <a href="https://github.com/yourusername/streamify" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                GitHub repository
              </a>.
            </p>
          </section>

          {/* Educational Use Notice */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-6 mt-8">
            <h2 className="text-xl font-bold text-purple-400 mb-3 flex items-center gap-2">
              <Code size={20} />
              Educational & Research Use
            </h2>
            <p className="text-gray-300 leading-relaxed">
              This project was created for educational purposes to demonstrate modern web technologies,
              API integration, and desktop application development. It is not intended for commercial use
              or large-scale deployment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
