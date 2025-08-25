import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        https: {
            key: fs.readFileSync(path.resolve(__dirname, '../certs/localhost.key')),
            cert: fs.readFileSync(path.resolve(__dirname, '../certs/localhost.crt')),
        },
        port: 5173,
        host: 'localhost',
        // Handle certificate errors in development
        proxy: {
            '/api': {
                target: 'https://localhost:3001',
                changeOrigin: true,
                secure: false // Allow self-signed certificates
            }
        }
    }
})
