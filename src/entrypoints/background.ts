import { logger } from "@/lib/utils/logger";
import { BOT_ENDPOINT } from "@/lib/constants";
import { getEnabled, getSecret } from "@/lib/storage";

export default defineBackground(() => {
    logger.info("Background script initialized", { id: browser.runtime.id });

    browser.cookies.onChanged.addListener(async ({ cookie, removed }) => {
        if (removed || cookie.name !== "sessionKey" || !cookie.domain.includes("claude.ai")) return;

        const enabled = await getEnabled();
        if (!enabled) {
            logger.debug("Extension disabled, skipping token update");
            return;
        }

        const secret = await getSecret();
        if (!secret) {
            logger.warn("No secret configured — open the extension popup to set it");
            return;
        }

        logger.debug("sessionKey cookie set, updating bot token");

        fetch(BOT_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: cookie.value, secret }),
        })
            .then((res) => res.json())
            .then((data: { status: string; error?: string }) => {
                if (data.status === "ok") {
                    logger.info("Token updated successfully");
                } else {
                    // 403 "wrong account" is expected on work account login
                    logger.info("Token update skipped:", data.error);
                }
            })
            .catch((err) => logger.error("Failed to reach bot endpoint:", err));
    });
});
