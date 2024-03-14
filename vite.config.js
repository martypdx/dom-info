import { defineConfig } from 'vite';

export default defineConfig({
    test: {
        browser: {
            headless: true,
            enabled: true,
            name: 'chrome', // browser name is required
        },
    }
})