<script lang="ts">
    import { getEnabled, setEnabled, watchEnabled } from "@/lib/storage";
    import { logger } from "@/lib/utils/logger";

    let enabled = $state(true);
    let loading = $state(true);

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

        const unwatch = watchEnabled((value) => {
            enabled = value;
        });

        return () => unwatch();
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
    {/if}
</main>
