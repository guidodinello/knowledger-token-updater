<script lang="ts">
    import { untrack } from "svelte";
    import { getEnabled, setEnabled, watchEnabled, getSecret, setSecret, watchSecret } from "@/lib/storage";
    import { logger } from "@/lib/utils/logger";

    let enabled = $state(true);
    let loading = $state(true);
    let storedSecret = $state("");
    let secretInput = $state("");
    let saved = $state(false);
    let savedTimer = 0;

    getEnabled()
        .then((value) => {
            enabled = value;
            loading = false;
        })
        .catch((err) => {
            logger.error("Failed to load enabled state", err);
            loading = false;
        });

    getSecret()
        .then((value) => {
            storedSecret = value;
        })
        .catch((err) => {
            logger.error("Failed to load secret", err);
        });

    $effect(() => {
        const unwatchEnabled = watchEnabled((value) => {
            untrack(() => {
                enabled = value;
            });
        });
        return () => unwatchEnabled();
    });

    $effect(() => {
        const unwatchSecret = watchSecret((value) => {
            untrack(() => {
                storedSecret = value;
            });
        });
        return () => unwatchSecret();
    });

    async function toggle() {
        try {
            const newState = !enabled;
            await setEnabled(newState);
            enabled = newState;
        } catch (err) {
            logger.error("Failed to toggle extension", err);
        }
    }

    async function saveSecret() {
        try {
            await setSecret(secretInput);
            storedSecret = secretInput;
            secretInput = "";
            clearTimeout(savedTimer);
            saved = true;
            savedTimer = window.setTimeout(() => {
                saved = false;
                savedTimer = 0;
            }, 2000);
        } catch (err) {
            logger.error("Failed to save secret", err);
        }
    }
</script>

<main class="p-4 min-w-[280px] flex flex-col gap-3">
    {#if loading}
        <div class="h-20 flex items-center justify-center text-sm text-gray-400">Loading...</div>
    {:else}
        <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {enabled ? "Active" : "Inactive"}
            </span>
            <button
                type="button"
                onclick={toggle}
                aria-label={enabled ? "Disable extension" : "Enable extension"}
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {enabled
                    ? 'bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'}"
            >
                <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {enabled
                        ? 'translate-x-6'
                        : 'translate-x-1'}"
                ></span>
            </button>
        </div>

        <div class="flex gap-2">
            <input
                type="password"
                bind:value={secretInput}
                placeholder={storedSecret ? `••••••••••••${storedSecret.slice(-4)}` : "Secret"}
                class="flex-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
                type="button"
                onclick={saveSecret}
                class="w-16 py-1.5 text-sm font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 {saved
                    ? 'bg-green-700 text-white focus:ring-green-700'
                    : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'}"
            >
                {saved ? "Saved" : "Save"}
            </button>
        </div>
    {/if}
</main>
