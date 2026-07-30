/**
 * Response shape of the bot's `POST /update-token` endpoint.
 *
 * Mirrors `UpdateOutcome` in the knowledger repo
 * (`knowledger/http_server.py::_handle_update_token`), whose request/response contract is
 * pinned by `tests/test_http_server_contract.py` there. Keep the two in step.
 *
 * `adopted` — the bot took up the posted token.
 * `ignored` — the bot's own token still works, so the posted one was discarded. Expected
 *   whenever the bot holds a dedicated claude.ai session rather than borrowing this
 *   browser's, which is the normal setup.
 * The third member covers every error status (403 wrong secret or wrong account, 401 invalid
 *   token, 503 the bot could not verify its current token, 500 persistence failure).
 *
 * The `?: never` markers make this a discriminated union that narrows on `outcome`, so the
 * error branch can reach `error` without a cast.
 */
export type UpdateResponse =
    | { outcome: "adopted"; reason?: never; error?: never }
    | { outcome: "ignored"; reason: string; error?: never }
    | { outcome?: never; reason?: never; error: string };
