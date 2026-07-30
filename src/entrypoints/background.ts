import { logger } from "@/lib/utils/logger";
import { BOT_ENDPOINT } from "@/lib/constants";
import { getEnabled, getSecret } from "@/lib/storage";
import type { UpdateResponse } from "@/lib/types";

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

        // Contract with the receiving endpoint (knowledger repo,
        // knowledger/http_server.py::_handle_update_token, tests/test_http_server_contract.py):
        // request is {secret, token}, response is an UpdateResponse with the shape pinned by
        // a test in that repo.
        fetch(BOT_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: cookie.value, secret }),
        })
            .then((res) => res.json())
            .then((data: UpdateResponse) => {
                switch (data.outcome) {
                    case "adopted":
                        logger.info("Token updated successfully");
                        break;
                    case "ignored":
                        // The bot holds its own dedicated claude.ai session and it's still
                        // alive, so it kept its token rather than take this browser's.
                        logger.info("Token unchanged:", data.reason);
                        break;
                    default:
                        // 403 "wrong account" is expected on work account login
                        logger.info("Token update skipped:", data.error);
                }
            })
            .catch((err) => logger.error("Failed to reach bot endpoint:", err));
    });
});
