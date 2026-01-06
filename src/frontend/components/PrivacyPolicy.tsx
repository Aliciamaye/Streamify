import React from 'react';
import { ArrowLeft, Shield, Eye, Database, Lock, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PrivacyPolicy: React.FC = () => {
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
          <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-4 rounded-full">
            <Shield className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
            <p className="text-gray-400">Last updated: January 6, 2026</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-8">
          {/* TL;DR Summary */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg p-6">
            <h2 className="text-xl font-bold text-green-400 mb-3 flex items-center gap-2">
              <Eye size={20} />
              TL;DR - Your Privacy Matters
            </h2>
            <div className="text-gray-300 space-y-2">
              <p>✅ <strong>No data collection</strong> - We don't have servers or analytics</p>
              <p>✅ <strong>Everything is local</strong> - All data stays on your device</p>
              <p>✅ <strong>No tracking</strong> - No cookies, no telemetry, no third-party trackers</p>
              <p>✅ <strong>Open source</strong> - Verify the code yourself on GitHub</p>
            </div>
          </div>

          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              Streamify is a desktop application that prioritizes your privacy. Unlike web-based services,
              Streamify runs entirely on your local machine and <strong>does not send your data to our servers</strong>{' '}
              (because we don't have any).
            </p>
            <p className="text-gray-300 leading-relaxed">
              This Privacy Policy explains what data is stored locally, how third-party integrations work,
              and your rights regarding your information.
            </p>
          </section>

          {/* What We Collect (Nothing!) */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Database size={24} className="text-blue-400" />
              What Data We Collect
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              <strong className="text-green-400">Short answer: None.</strong> Streamify does not collect, transmit,
              or store any of your data on external servers.
            </p>
            
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Data Stored Locally on Your Device:</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong>User Account:</strong> Username, email (hashed), preferences</li>
                <li><strong>Playlists:</strong> Your created playlists and saved tracks</li>
                <li><strong>Playback History:</strong> Recently played songs (local only)</li>
                <li><strong>Integration Tokens:</strong> OAuth tokens for Spotify, Apple Music, Last.fm</li>
                <li><strong>Settings:</strong> Theme, quality preferences, notifications</li>
                <li><strong>Cache:</strong> Temporary files for faster loading</li>
              </ul>
            </div>
          </section>

          {/* How Data is Stored */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Lock size={24} className="text-yellow-400" />
              How Your Data is Stored
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Local Database (SQLite)</h3>
                <p className="text-gray-300 leading-relaxed">
                  All your data is stored in a local SQLite database file located in your application data folder:
                </p>
                <div className="bg-black/30 rounded-lg p-3 mt-2 font-mono text-sm text-gray-400">
                  <p>Windows: C:\Users\YourName\AppData\Roaming\Streamify\</p>
                  <p>macOS: ~/Library/Application Support/Streamify/</p>
                  <p>Linux: ~/.config/Streamify/</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Encryption</h3>
                <p className="text-gray-300 leading-relaxed">
                  Sensitive data such as integration tokens are encrypted using AES-256 encryption before being
                  stored locally. Your device's keychain or credential manager is used when available.
                </p>
              </div>
            </div>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Globe size={24} className="text-purple-400" />
              Third-Party Services
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              When you connect third-party services, Streamify communicates directly with their APIs:
            </p>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 border border-green-500/30">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Spotify</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  When you connect Spotify, OAuth tokens are stored locally. Streamify uses these tokens to import
                  playlists on your behalf. Data sent: None. Data received: Your playlists.
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-pink-500/30">
                <h3 className="text-lg font-semibold text-pink-400 mb-2">Apple Music</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Apple Music integration requires a developer token (generated locally) and your Music User Token.
                  No data is sent to Streamify servers. Apple's privacy policy applies.
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-red-500/30">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Last.fm</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Last.fm scrobbling sends your playback data to Last.fm's servers (not ours). Your session key
                  is stored locally. Last.fm's privacy policy applies to scrobbled data.
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-indigo-500/30">
                <h3 className="text-lg font-semibold text-indigo-400 mb-2">Discord</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Discord webhooks send messages to your configured Discord channel. Webhook URLs are stored locally.
                  No data is sent through Streamify servers.
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-gray-500/30">
                <h3 className="text-lg font-semibold text-gray-400 mb-2">Content Sources</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Streamify streams music from publicly available sources. Your IP address may be visible to
                  these sources (standard for any internet connection). We do not track or log your listening activity.
                </p>
              </div>
            </div>
          </section>

          {/* Analytics and Tracking */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Analytics and Tracking</h2>
            <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg p-6">
              <p className="text-lg text-green-400 font-semibold mb-2">We do NOT use:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                <li>Google Analytics or similar services</li>
                <li>Crash reporting tools</li>
                <li>Telemetry or usage statistics</li>
                <li>Advertising networks</li>
                <li>Third-party cookies or tracking pixels</li>
              </ul>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Your Rights</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              Because all data is stored locally, you have complete control:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li><strong>Access:</strong> View your data anytime in the app's data folder</li>
              <li><strong>Export:</strong> Copy the database file to back up your data</li>
              <li><strong>Delete:</strong> Uninstall the app to remove all data</li>
              <li><strong>Modify:</strong> Edit settings and preferences at any time</li>
              <li><strong>Portability:</strong> Your data is in standard SQLite format</li>
            </ul>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Data Retention</h2>
            <p className="text-gray-300 leading-relaxed">
              Data is retained on your device until you manually delete it or uninstall the application.
              There are no automatic deletions, and nothing is sent to external servers for archival.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Children's Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              Streamify is not directed at children under 13. We do not knowingly collect personal information
              from children. Parents and guardians should supervise children's use of the application.
            </p>
          </section>

          {/* Open Source Verification */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Open Source & Transparency</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              Streamify is open source. You can verify our privacy claims by reviewing the source code:
            </p>
            <a
              href="https://github.com/yourusername/streamify"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all"
            >
              View Source Code on GitHub
            </a>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Changes to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. Changes will be reflected in the application
              and on our website. The "Last Updated" date at the top indicates when changes were last made.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              Questions about this Privacy Policy? Open an issue on our{' '}
              <a href="https://github.com/yourusername/streamify" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                GitHub repository
              </a>.
            </p>
          </section>

          {/* GDPR/CCPA Notice */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-6 mt-8">
            <h2 className="text-xl font-bold text-blue-400 mb-3">GDPR & CCPA Compliance</h2>
            <p className="text-gray-300 leading-relaxed">
              Because Streamify does not collect, process, or store user data on external servers, GDPR and CCPA
              regulations regarding data processing do not apply to our service. However, we recommend reviewing
              the privacy policies of third-party services you integrate (Spotify, Apple Music, Last.fm, Discord).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
