import { logger } from "@/lib/utils/logger";
import { BOT_ENDPOINT, TOKEN_UPDATE_SECRET } from "@/lib/constants";

export default defineBackground(() => {
    logger.info("Background script initialized", { id: browser.runtime.id });

    browser.cookies.onChanged.addListener(({ cookie, removed }) => {
        if (removed || cookie.name !== "sessionKey" || !cookie.domain.includes("claude.ai")) return;

        logger.debug("sessionKey cookie set, updating bot token");

        fetch(BOT_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: cookie.value, secret: TOKEN_UPDATE_SECRET }),
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
