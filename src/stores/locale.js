import { acceptHMRUpdate, defineStore } from 'pinia'
import { availableLocales, loadLanguageAsync } from '~/modules/vue-i18n'
import { useI18n } from 'vue-i18n'

export const useLocaleStore = defineStore('locale', () => {
	const { locale } = useI18n()

	async function toggleLocales() {
		const locales = availableLocales
		const newLocale = locales[(locales.indexOf(locale.value) + 1) % locales.length]
		await loadLanguageAsync(newLocale)
		locale.value = newLocale
	}

	return {
		toggleLocales,
	}
})

/**
 * HMR (Hot Module Replacement)
 * https://pinia.vuejs.org/cookbook/hot-module-replacement.html
 */
if (import.meta.hot)
	import.meta.hot.accept(acceptHMRUpdate(useLocaleStore, import.meta.hot))
