import { writeFile } from 'fs';

import  translate from 'google-translate-api-x';
import { languages } from 'google-translate-api-x';
import en from './0en.json' assert { type: "json" };

// "am", "ar", "az",  "bg", "bn", "bs", "ca", "cs", "da", "de", "el", "eo", "es", "et", "eu", "fa", "fi", 
// "fr",  "ga",  "gl",
// "gu",  "he", "hi", "hr", "hu", "it", "ja", "ka", "kk", "km", "ko", "la", "lt", "lv", "mg", "ml", "mn", 

// "es_CL", "es_CO", "es_DO", "es_SV", "es_VE", "fil", "fr_CM", "fr_LU", "ga_IE", "gl_ES","hak","nb", 
// "pt_BR", "sr@ijekavianlatin", "sr@latin","uz@Cyrl", "uz@Latn",  "yue", "zh-Hans", "zh-Hant", "zh_HK", "zh_TW"

//let locales = [   "ne", "nl", "pa", "pl", "pt", "ro", "ru", "si", "sk", "sl", "sr", "sv", "ta", "te", "tk", "tl", "tr", "uk", "ur", "uz",  "zh", ];
//console.log(JSON.stringify(languages))
let locales = Object.keys(languages)

async function translateLocale(localeTag) {
  const res = await translate(en, { from: 'en', to: localeTag });

  let locale = {}
  for (var key in res) {
    locale[key] = res[key].text
  }
  locale['locale'] = localeTag

  writeFile(localeTag + '.json', JSON.stringify(locale, null, 2), (error) => {
    if (error) {
      console.log('An error has occurred ', error);
      return;
    }
    console.log('Data written successfully to disk');
  });

}

async function process(){
  for(let l of locales){
    console.log(l)
    await translateLocale(l)
  }
}
process();