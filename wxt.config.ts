import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
    srcDir: "src",
    modules: ["@wxt-dev/module-svelte"],
    manifest: {
        name: "Knowledger Token Updater",
        description: "Automatically updates the knowledger bot token when you log into claude.ai.",
        permissions: ["cookies"],
        host_permissions: ["https://claude.ai/*"],
        icons: {
            16: "icons/icon-16.png",
            32: "icons/icon-32.png",
            48: "icons/icon-48.png",
            128: "icons/icon-128.png",
        },
        browser_specific_settings: {
            gecko: {
                id: "knowledger-token-updater@guidodinello.dev",
                // Required by Firefox for all new extensions. This extension does not collect any user data
                // @ts-ignore
                data_collection_permissions: { required: ["none"] },
            },
        },
    },
    vite: () => ({
        plugins: [tailwindcss()],
    }),
    runner: {
        startUrls: ["https://claude.ai"],
    },
});
