<script lang="ts">
    import { getEnabled, setEnabled, watchEnabled, getSecret, setSecret, watchSecret } from "@/lib/storage";
    import { logger } from "@/lib/utils/logger";

    let enabled = $state(true);
    let loading = $state(true);

    let secretInput = $state("");
    let showSecret = $state(false);
    let savedConfirmation = $state(false);
    let savedTimer: ReturnType<typeof setTimeout> | null = null;

    $effect(() => {
        getEnabled()
            .then((value) => {
                enabled = value;
                loading = false;
            })
            .catch((err) => {
                logger.error("Failed to load enabled state", err);
                loading = false;
            });

        const unwatchEnabled = watchEnabled((value) => {
            enabled = value;
        });

        return () => unwatchEnabled();
    });

    $effect(() => {
        getSecret()
            .then((value) => {
                secretInput = value;
            })
            .catch((err) => {
                logger.error("Failed to load secret", err);
            });

        const unwatchSecret = watchSecret((value: string) => {
            secretInput = value;
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
            if (savedTimer !== null) {
                clearTimeout(savedTimer);
            }
            savedConfirmation = true;
            savedTimer = setTimeout(() => {
                savedConfirmation = false;
                savedTimer = null;
            }, 2000);
        } catch (err) {
            logger.error("Failed to save secret", err);
        }
    }
</script>

<main class="p-6 min-w-[300px] flex flex-col gap-4">
    <div class="flex items-center gap-3">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Knowledger Token Updater</h1>
    </div>

    {#if loading}
        <div class="flex items-center justify-center py-4">
            <div class="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
    {:else}
        <div class="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div class="flex flex-col">
                <span class="font-medium text-gray-900 dark:text-white">Enable</span>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                    {enabled ? "Active" : "Inactive"}
                </span>
            </div>

            <button
                type="button"
                onclick={toggle}
                aria-label={enabled ? "Disable extension" : "Enable extension"}
                class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors {enabled
                    ? 'bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'}"
            >
                <span
                    class="inline-block h-6 w-6 transform rounded-full bg-white transition-transform {enabled
                        ? 'translate-x-7'
                        : 'translate-x-1'}"
                ></span>
            </button>
        </div>

        <div class="flex flex-col gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <span class="font-medium text-gray-900 dark:text-white">Secret</span>

            {#if !secretInput}
                <div class="flex items-center gap-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm text-yellow-700 dark:text-yellow-300">No secret configured. The token endpoint will be unprotected.</span>
                </div>
            {/if}

            <div class="flex items-center gap-2">
                <div class="relative flex-1">
                    <input
                        type={showSecret ? "text" : "password"}
                        bind:value={secretInput}
                        placeholder="Enter secret..."
                        class="w-full px-3 py-2 pr-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                        type="button"
                        onclick={() => (showSecret = !showSecret)}
                        class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        aria-label={showSecret ? "Hide secret" : "Show secret"}
                    >
                        {#if showSecret}
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                            </svg>
                        {:else}
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                            </svg>
                        {/if}
                    </button>
                </div>

                <button
                    type="button"
                    onclick={saveSecret}
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Save
                </button>
            </div>

            {#if savedConfirmation}
                <div class="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm text-green-700 dark:text-green-300">Saved</span>
                </div>
            {/if}
        </div>
    {/if}
</main>
