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
