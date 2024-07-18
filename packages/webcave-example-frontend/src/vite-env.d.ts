/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_IS_MULTIPLAYER: string
  readonly VITE_APP_SERVER_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module "*.png";
declare module "*.svg";
declare module "*.jpeg";
declare module "*.jpg";