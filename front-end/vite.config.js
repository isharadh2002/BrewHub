import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

export default defineConfig(({ mode }) => {

    const isDev = mode === 'development'
    console.log("Is Development Mode :" + isDev)

    // Check if certificate files exist
    const certKeyPath = path.resolve(__dirname, '../certs/localhost.key')
    const certPath = path.resolve(__dirname, '../certs/localhost.crt')
    const hasCerts = fs.existsSync(certKeyPath) && fs.existsSync(certPath)

    console.log("Has Certificates :" + hasCerts)

    // Only use HTTPS in development when certificates exist
    const shouldUseHTTPS = isDev && hasCerts

    return {
        plugins: [react(), tailwindcss()],
        server: {
            ...(hasCerts && {
                https: {
                    key: fs.readFileSync(path.resolve(__dirname, '../certs/localhost.key')),
                    cert: fs.readFileSync(path.resolve(__dirname, '../certs/localhost.crt')),
                }
            }),
            port: 5173,
            host: 'localhost',
            // Handle certificate errors in development
            proxy: {
                '/api': {
                    target: process.env.VITE_API_URL || 'https://localhost:3001',
                    changeOrigin: true,
                    secure: false // Allow self-signed certificates
                }
            }
        }
    }
})
