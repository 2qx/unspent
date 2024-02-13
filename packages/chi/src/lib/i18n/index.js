// src/lib/i18n.ts
import { register } from 'svelte-i18n';


register("en", () => import(`$lib/locale/en.json`))

const langs = [
  "af", "ak", "am", "ar", "as", "ay", "az", "be", "bg", "bho", "bm", "bn", "bs", "ca",
  "ceb", "ckb", "co", "cs", "cy", "da", "de", "doi", "dv", "ee", "el", "en", "eo", "es", "et", "eu",
  "fa", "fi", "fr", "fy", "ga", "gd", "gl", "gn", "gom", "gu", "ha", "haw", "he", "hi", "hmn", "hr",
  "ht", "hu", "hy", "id", "ig", "ilo", "is", "it", "iw", "ja", "jw", "ka", "kk", "km", "kn", "ko",
  "kri", "ku", "ky", "la", "lb", "lg", "ln", "lo", "lt", "lus", "lv", "mai", "mg", "mi", "mk", "ml",
  "mn", "mni-Mtei", "mr", "ms", "mt", "my", "ne", "nl", "no", "nso", "ny", "om", "or", "pa", "pl",
  "ps", "pt", "qu", "ro", "ru", "rw", "sa", "sd", "si", "sk", "sl", "sm", "sn", "so", "sq", "sr",
  "st", "su", "sv", "sw", "ta", "te", "tg", "th", "ti", "tk", "tl", "tr", "ts", "tt", "ug", "uk",
  "ur", "uz", "vi", "xh", "yi", "yo", "zh", "zh-CN", "zh-TW", "zu"
]


for (const lang of langs) {
  register(lang, () => import(`$lib/locale/${lang}.json`))
}


// init({
//   fallbackLocale: defaultLocale,
//   initialLocale: browser ? window.navigator.language.split("-").shift() : defaultLocale,
// })