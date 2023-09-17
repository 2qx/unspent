// src/lib/i18n.ts
import { browser } from '$app/environment'
import { init, register } from 'svelte-i18n';
const defaultLocale = 'en'

const langs = [
  "am", "cs", "es", "fr", "hi", "la", "pa", "sr@ijekavianlatin",
  "uk", "zh_TW", " ar", "da", "es_SV", "fr_LU", "hr", "lt", "pl",
  "sr", "ur", " az", "de", "es_VE", "ga_IE", "hu", "lv", "pt_BR",
  "sr@latin", "uz@Cyrl", "az@latin", "el", "et", "ga", "it", "mg",
  "pt", "sv", "uz", " bg", "en", "eu", "gl_ES", "ja", "ml", "ro",
  "ta", "uz@Latn", " bn", "eo", "fa", "gl", "ka", "mn", "ru", "te",
  "yue", " bs", "es_CL", "fi", "gu", "kk", "nb", "si", "tk", "zh-Hans",
  " ca", "es_CO", "fil", "hak", "km", "ne", "sk", "tl", "zh-Hant", " cmn",
  "es_DO", "fr_CM", "he", "ko", "nl", "sl", "tr", "zh_HK"
]


for (const lang of langs) {
  register(lang, () => import(`../../locale/${lang}.json`))
}
// register('am', () => import('../../locale/am.json'))
// register('ar', () => import('../../locale/ar.json'))
// register('az', () => import('../../locale/az.json'))
// register('bg', () => import('../../locale/bg.json'))
// register('bn', () => import('../../locale/bn.json'))
// register('bs', () => import('../../locale/bs.json'))
// register('ca', () => import('../../locale/ca.json'))
// register('cmn', () => import('../../locale/cmn.json'))
// register('cs', () => import('../../locale/cs.json'))
// register('da', () => import('../../locale/da.json'))
// register('de', () => import('../../locale/de.json'))
// register('el', () => import('../../locale/el.json'))
// register('en', () => import('../../locale/en.json'))
// register('eo', () => import('../../locale/eo.json'))
// register('es_CL', () => import('../../locale/es_CL.json'))
// register('es_CO', () => import('../../locale/es_CO.json'))
// register('es_DO', () => import('../../locale/es_DO.json'))
// register('es_SV', () => import('../../locale/es_SV.json'))
// register('es_VE', () => import('../../locale/es_VE.json'))
// register('es', () => import('../../locale/es.json'))
// register('et', () => import('../../locale/et.json'))
// register('eu', () => import('../../locale/eu.json'))
// register('fa', () => import('../../locale/fa.json'))
// register('fi', () => import('../../locale/fi.json'))
// register('fil', () => import('../../locale/fil.json'))
// register('fr_CM', () => import('../../locale/fr_CM.json'))
// register('fr_LU', () => import('../../locale/fr_LU.json'))
// register('fr', () => import('../../locale/fr.json'))
// register('zh', () => import('../../locale/zh-Hans.json'))
// register('zh-Hant', () => import('../../locale/zh-Hant.json'))

init({
  fallbackLocale: defaultLocale,
  initialLocale: browser ? window.navigator.language : defaultLocale,
})