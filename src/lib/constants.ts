export const BOT_ENDPOINT = import.meta.env.VITE_BOT_ENDPOINT as string;

export const STORAGE_KEYS = {
    ENABLED: "KNOWLEDGER_enabled",
    SECRET: "KNOWLEDGER_secret",
} as const;

export const DEFAULT_SETTINGS = {
    enabled: true,
    secret: "",
} as const;
