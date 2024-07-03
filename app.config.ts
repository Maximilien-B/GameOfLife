import {defineConfig} from "@solidjs/start/config";

export default defineConfig({
    server: {
        baseURL: process.env.BASE_URL, preset: "static", prerender: {
            failOnError: true, routes: ["/"], crawlLinks: true,
        },
    },
});
