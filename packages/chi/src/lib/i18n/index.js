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
  "es_DO", "fr_CM", "he", "ko", "nl", "sl", "tr", "zh_HK","zh"
]


for (const lang of langs) {
  register(lang, () => import(`../../locale/${lang}.json`))
}


init({
  fallbackLocale: defaultLocale,
  initialLocale: browser ? window.navigator.language : defaultLocale,
})