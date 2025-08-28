/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_LLM_AGENTS?: string
  readonly VITE_OPENAI_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}