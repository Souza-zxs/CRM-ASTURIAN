/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REACT_APP_FUNNEL_API_URL: string;
  readonly REACT_APP_FUNNEL_WORKSPACE_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
