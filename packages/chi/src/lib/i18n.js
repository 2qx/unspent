// src/lib/i18n.ts
import { browser } from '$app/environment'
import { init, register } from 'svelte-i18n';
const defaultLocale = 'en'

register('en', () => import('./locales/en.json'))
register('es', () => import('../locales/es.json'))
register('fr', () => import('./locales/fr.json'))
register('zh', () => import('./locales/zh-Hans.json'))
register('zh-Hant', () => import('../locales/zh-Hant.json'))

init({
	fallbackLocale: defaultLocale,
	initialLocale: browser ? window.navigator.language : defaultLocale,
})