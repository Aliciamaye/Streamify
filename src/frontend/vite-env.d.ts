/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string;
    readonly VITE_API_SERVER?: string;
    readonly VITE_SPOTIFY_CLIENT_ID?: string;
    readonly VITE_APPLE_MUSIC_KEY?: string;
    readonly VITE_LASTFM_API_KEY?: string;
    readonly VITE_DISCORD_CLIENT_ID?: string;
    readonly VITE_ENVIRONMENT?: string;
    readonly VITE_VERSION?: string;
    // Add other env variables here as needed
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
