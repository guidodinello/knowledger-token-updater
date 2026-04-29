import { logger } from "@/lib/utils/logger";

export default defineBackground(() => {
    logger.info("Background script initialized", { id: browser.runtime.id });
});
