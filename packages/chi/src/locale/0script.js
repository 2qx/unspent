import { writeFile } from 'fs';

import  translate from 'google-translate-api-x';
import { languages } from 'google-translate-api-x';
import en from './0en.json' assert { type: "json" };

let locales = Object.keys(languages)

async function translateLocale(localeTag) {
  const res = await translate(en, { from: 'en', to: localeTag });

  let locale = {}
  for (var key in res) {
    locale[key] = res[key].text
  }
  locale['locale'] = localeTag

  if(localeTag == "he" || localeTag =="ar"){
    locale['direction'] = "rtl"
  }

  if(localeTag == "zh" || localeTag =="zh-CN"){
    locale['bitcoin.jpg'] = "https://web.archive.org/web/20230315051200/https://whitepaper.coinspice.io/cn"
  }
  if(localeTag == "jp"){
    locale['bitcoin.jpg'] =  "https://web.archive.org/web/20200217125719/https://www.bitcoin.jp/what-is-bitcoin/bitcoin-whitepaper-comic/"
  }
  if(localeTag == "en"){
    locale['bitcoin.jpg'] =  "https://web.archive.org/web/20230215013643/https://whitepaper.coinspice.io/"
    locale['direction'] = "ltr"
  }

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