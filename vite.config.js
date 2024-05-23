import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import VueI18n from '@intlify/unplugin-vue-i18n/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { unheadVueComposablesImports } from '@unhead/vue'
import { VitePWA } from 'vite-plugin-pwa'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
	console.log('🦕 vite.config.js/defineConfig', command, mode)

	return {
		base: mode === 'development' ? './' : '/csv-umbrella/',

		resolve: {
			alias: {
				'~/': `${path.resolve(__dirname, 'src')}/`,
			},
		},

		plugins: [
			vue(),

			// https://github.com/unocss/unocss
			Unocss(),

			// https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n
			VueI18n({
				runtimeOnly: true,
				compositionOnly: true,
				fullInstall: true,
				include: [path.resolve(__dirname, 'locales/**')],
			}),

			// https://github.com/antfu/unplugin-auto-import
			AutoImport({
				imports: [
					'vue',
					'vue-router',
					'vue-i18n',
					'@vueuse/core',
					unheadVueComposablesImports,
				],
				dts: 'src/auto-imports.d.ts',
				dirs: [
					'src/composables',
					'src/stores',
				],
				vueTemplate: true,
			}),

			// https://github.com/antfu/vite-plugin-pwa
			VitePWA({
				registerType: 'autoUpdate',
				injectRegister: 'auto',
				includeAssets: ['favicons/favicon.svg', 'favicons/safari-pinned-tab.svg'],
				manifest: {
					name: 'CSV Umbrella',
					short_name: 'CSV Umbrella',
					theme_color: '#ffffff',
					icons: [
						{
							src: '/favicons/pwa-192x192.png',
							sizes: '192x192',
							type: 'image/png',
						},
						{
							src: '/favicons/pwa-512x512.png',
							sizes: '512x512',
							type: 'image/png',
						},
						{
							src: '/favicons/pwa-512x512.png',
							sizes: '512x512',
							type: 'image/png',
							purpose: 'any maskable',
						},
					],
				},
			}),
		],
	}
})
