/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Mapbox GL public access token. Exposed to the client (VITE_ prefix). */
  readonly VITE_MAPBOX_ACCESS_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
