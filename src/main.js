import { createApp } from 'vue'
import App from './App.vue'

/**
 * Styles
 */
import 'uno.css'
import './style.css'

/**
 * Modules
 */
import { head } from './modules/unhead'
import { i18n, loadLanguageAsync, getDefaultLocale } from './modules/vue-i18n'

/**
 * init app
 */
createApp(App)
	.use(i18n)
	.use(head)
	.mount('#app')

/**
 * do something after init app
 */
const defaultLocale = getDefaultLocale()
loadLanguageAsync(defaultLocale)
