import { writeFile } from 'fs';

import translate from 'google-translate-api-x';
import { languages } from 'google-translate-api-x';
import en from './0en.json' assert { type: "json" };

const bitcoin_pdf = {
  am: "https://bitcoin.org/files/bitcoin-paper/bitcoin_am.pdf",
  ar: ":https://bitcoin.org/files/bitcoin-paper/bitcoin_ar.pdf",
  bn: "https://bitcoin.org/files/bitcoin-paper/bitcoin_bn.pdf",
  cs: "https://bitcoin.org/files/bitcoin-paper/bitcoin_cz.pdf",
  de: "https://bitcoin.org/files/bitcoin-paper/bitcoin_de.pdf",
  es: "https://bitcoin.org/files/bitcoin-paper/bitcoin_es.pdf",
  et: "https://bitcoin.org/files/bitcoin-paper/bitcoin_et.pdf",
  fa: "https://bitcoin.org/files/bitcoin-paper/bitcoin_fa.pdf",
  fi: "https://bitcoin.org/files/bitcoin-paper/bitcoin_fi.pdf",
  fr: "https://bitcoin.org/files/bitcoin-paper/bitcoin_fr.pdf",
  hi: "https://bitcoin.org/files/bitcoin-paper/bitcoin_hi.pdf",
  hr: "https://bitcoin.org/files/bitcoin-paper/bitcoin_hr.pdf",
  hu: "https://bitcoin.org/files/bitcoin-paper/bitcoin_hu.pdf",
  id: "https://bitcoin.org/files/bitcoin-paper/bitcoin_id.pdf",
  is: "https://bitcoin.org/files/bitcoin-paper/bitcoin_is.pdf",
  it: "https://bitcoin.org/files/bitcoin-paper/bitcoin_it.pdf",
  iw: "https://bitcoin.org/files/bitcoin-paper/bitcoin_iw.pdf",
  ja: "https://bitcoin.org/files/bitcoin-paper/bitcoin_jp.pdf",
  ko: "https://bitcoin.org/files/bitcoin-paper/bitcoin_ko.pdf",
  lt: "https://bitcoin.org/files/bitcoin-paper/bitcoin_lt.pdf",
  ml: "https://bitcoin.org/files/bitcoin-paper/bitcoin_ml.pdf",
  mr: "https://bitcoin.org/files/bitcoin-paper/bitcoin_mr.pdf",
  ne: "https://bitcoin.org/files/bitcoin-paper/bitcoin_np.pdf",
  nl: "https://bitcoin.org/files/bitcoin-paper/bitcoin_nl.pdf",
  no: "https://bitcoin.org/files/bitcoin-paper/bitcoin_no.pdf",
  pl: "https://bitcoin.org/files/bitcoin-paper/bitcoin_pl.pdf",
  pt: "https://bitcoin.org/files/bitcoin-paper/bitcoin_pt.pdf",
  ro: "https://bitcoin.org/files/bitcoin-paper/bitcoin_ro.pdf",
  ru: "https://bitcoin.org/files/bitcoin-paper/bitcoin_ru.pdf",
  sk: "https://bitcoin.org/files/bitcoin-paper/bitcoin_sk.pdf",
  sq: "https://bitcoin.org/files/bitcoin-paper/bitcoin_al.pdf",
  sr: "https://bitcoin.org/files/bitcoin-paper/bitcoin_sr.pdf",
  ta: "https://bitcoin.org/files/bitcoin-paper/bitcoin_ta.pdf",
  th: "https://bitcoin.org/files/bitcoin-paper/bitcoin_th.pdf",
  tr: "https://bitcoin.org/files/bitcoin-paper/bitcoin_tr.pdf",
  uk: "https://bitcoin.org/files/bitcoin-paper/bitcoin_uk.pdf",
  ur: "https://bitcoin.org/files/bitcoin-paper/bitcoin_ur.pdf",
  vi: "https://bitcoin.org/files/bitcoin-paper/bitcoin_vi.pdf",
  "zh-CN": "https://bitcoin.org/files/bitcoin-paper/bitcoin_zh_cn.pdf",
  zh: "https://bitcoin.org/files/bitcoin-paper/bitcoin_zh_cn.pdf",
}

let locales = Object.keys(languages)

async function translateLocale(localeTag) {
  const res = await translate(en, { from: 'en', to: localeTag });

  let locale = {}
  for (var key in res) {
    locale[key] = res[key].text
  }
  locale['locale'] = localeTag

  if(Object.keys(bitcoin_pdf).includes(localeTag)){
    locale["bitcoin.pdf"] = bitcoin_pdf[localeTag]
  } 
  if (localeTag == "he" || localeTag == "ar") {
    locale['direction'] = "rtl"
  }

  if (localeTag == "zh" || localeTag == "zh-CN") {
    locale["wp_dir"] = "zh"
  }
  if (localeTag == "ja") {
    locale["wp_dir"] = "ja"
  }
  if (localeTag == "en") {
    locale["wp_dir"] = "en",
      locale['bitcoin.jpg'] = "./bitcoin.jpg"
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

async function process() {
  for (let l of locales) {
    console.log(l)
    await translateLocale(l)
  }
}
process();