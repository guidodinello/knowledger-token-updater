import { storage } from "wxt/storage";
import { STORAGE_KEYS, DEFAULT_SETTINGS } from "@/lib/constants";
import { logger } from "@/lib/utils/logger";

export async function getEnabled(): Promise<boolean> {
    const value = await storage.getItem<boolean>(`local:${STORAGE_KEYS.ENABLED}`);
    const enabled = value ?? DEFAULT_SETTINGS.enabled;
    logger.debug("getEnabled", enabled);
    return enabled;
}

export async function setEnabled(enabled: boolean): Promise<void> {
    logger.debug("setEnabled", enabled);
    await storage.setItem(`local:${STORAGE_KEYS.ENABLED}`, enabled);
}

export function watchEnabled(callback: (enabled: boolean) => void): () => void {
    return storage.watch<boolean>(`local:${STORAGE_KEYS.ENABLED}`, (newValue) => {
        const enabled = newValue ?? DEFAULT_SETTINGS.enabled;
        logger.debug("watchEnabled callback", enabled);
        callback(enabled);
    });
}

export async function getSecret(): Promise<string> {
    const value = await storage.getItem<string>(`local:${STORAGE_KEYS.SECRET}`);
    const secret = value ?? DEFAULT_SETTINGS.secret;
    logger.debug("getSecret", secret ? "[set]" : "[not set]");
    return secret;
}

export async function setSecret(secret: string): Promise<void> {
    logger.debug("setSecret", secret ? "[set]" : "[cleared]");
    await storage.setItem(`local:${STORAGE_KEYS.SECRET}`, secret);
}

export function watchSecret(callback: (secret: string) => void): () => void {
    return storage.watch<string>(`local:${STORAGE_KEYS.SECRET}`, (newValue) => {
        const secret = newValue ?? DEFAULT_SETTINGS.secret;
        logger.debug("watchSecret callback", secret ? "[set]" : "[not set]");
        callback(secret);
    });
}
