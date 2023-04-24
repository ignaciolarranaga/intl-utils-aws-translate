import fs from 'fs'
import { Glob } from 'glob'
import { Option, program } from 'commander'
import { Translate } from '@aws-sdk/client-translate'
import { Translations } from 'intl-utils'

// prettier-ignore
const LANGUAGES = [ 'af', 'sq', 'am', 'ar', 'hy',  'az', 'bn', 'bs', 'bg',
 'ca', 'zh', 'zh-TW', 'hr', 'cs', 'da', 'fa-AF', 'nl', 'en', 'et', 'fa', 'tl',
 'fi', 'fr', 'fr-CA', 'ka', 'de', 'el', 'gu', 'ht', 'ha', 'he', 'hi', 'hu',
 'is', 'id', 'ga', 'it', 'ja', 'kn', 'kk', 'ko', 'lv', 'lt', 'mk', 'ms', 'ml',
  'mt', 'mr', 'mn', 'no', 'ps', 'pl', 'pt', 'pt-PT', 'pa', 'ro', 'ru', 'sr',
  'si', 'sk', 'sl', 'so', 'es', 'es-MX', 'sw', 'sv', 'ta', 'te', 'th', 'tr',
  'uk', 'ur', 'uz', 'vi', 'cy',
]

const fromOption = new Option(
  '-f, --from [language]',
  'the language we are translating from'
)
  .choices(LANGUAGES)
  .makeOptionMandatory()
const toOption = new Option(
  '-t, --to [languages...]',
  'the languages to translate to'
)
  .choices(LANGUAGES)
  .makeOptionMandatory()

program
  .name('intl-util-aws-translate')
  .description(
    'Generates or populates the translation files based on AWS Translate. ' +
      'See supported languages in here: https://docs.aws.amazon.com/translate/latest/dg/what-is-languages.html'
  )
  .version('1.0.0')
  .option('--no-unchanged', 'Does not logs unchanged files')
  .option(
    '-p, --pattern [pattern]',
    'the pattern of the files',
    '**/*.translations.js'
  )
  .addOption(fromOption)
  .addOption(toOption)

program.parse()
const opts = program.opts()
const translateFrom = opts.from
const translateTo = opts.to
const pattern = opts.pattern
const logUnchanged = opts.unchanged

const translate = new Translate({})

interface Job {
  SourceLanguageCode: string
  TargetLanguageCode: string
  OriginalText: string
  Text: string
}

/**
 * This function calculates the keys to translate by investigating all the keys sampled
 * @param definition The definitions to calculate the translations
 * @returns An array containing all the keys to translate
 */
function calculateKeys(definition: Translations) {
  const keys = []
  for (const language of translateTo) {
    for (const key in definition[language]) {
      if (keys.indexOf(key) === -1) {
        keys.push(key)
      }
    }
  }

  return keys
}

/**
 * This function translates the contents of a file name, writing down the output on the same file
 * @param fileName The name of the file to process
 */
function translateFile(fileName: string) {
  let file = require(fileName)
  let definition = fileName.endsWith('.ts') ? file.default : file

  const jobs: Job[] = []
  const keys = calculateKeys(definition)

  for (const TargetLanguageCode of translateTo) {
    for (const key of keys) {
      if (
        !definition[TargetLanguageCode] ||
        !definition[TargetLanguageCode][key]
      ) {
        jobs.push({
          SourceLanguageCode: translateFrom,
          TargetLanguageCode,
          OriginalText: key,
          // When there is translation in the from language is because we want to replace the original text
          Text:
            definition[translateFrom] && definition[translateFrom][key]
              ? definition[translateFrom][key]
              : key,
        })
      }
    }
  }

  if (jobs.length > 0) {
    Promise.all(
      jobs.map(({ OriginalText, ...job }) => translate.translateText(job))
    ).then(results => {
      for (let i = 0; i < jobs.length; i++) {
        if (!definition[jobs[i].TargetLanguageCode]) {
          definition[jobs[i].TargetLanguageCode] = {}
        }
        definition[jobs[i].TargetLanguageCode][jobs[i].OriginalText] =
          results[i].TranslatedText
      }

      let contents
      if (fileName.endsWith('.js')) {
        contents =
          '/* prettier-ignore */\n' +
          '/* spellchecker: disable */\n' +
          `module.exports = ${JSON.stringify(definition, undefined, 2)}\n`
      } else if (fileName.endsWith('.ts')) {
        contents =
          '/* prettier-ignore */\n' +
          '/* spellchecker: disable */\n' +
          `export default ${JSON.stringify(definition, undefined, 2)}\n`
      } else {
        contents = JSON.stringify(definition, undefined, 2) + '\n'
      }

      fs.writeFile(fileName, contents, () => {
        console.log(`${fileName} was updated successfully`)
      })
    })
  } else {
    if (logUnchanged) {
      console.log(`Nothing to translate on ${fileName}`)
    }
  }
}

const files = new Glob(pattern, { withFileTypes: true })
for (const file of files) {
  translateFile(file.fullpath())
}
