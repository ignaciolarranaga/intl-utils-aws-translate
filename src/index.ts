import fs from 'fs';
import { Glob } from 'glob';
import { Translate } from "@aws-sdk/client-translate";

const translate = new Translate({});
const LANGUAGES = ['es', 'fr', 'it', 'pt'];

interface Job {
  SourceLanguageCode: string,
  TargetLanguageCode: string,
  OriginalText: string,
  Text: string,
}

/**
 * This function translates the contents of a file name, writing down the output on the same file
 * @param fileName The name of the file to process
 */
function translateFile(fileName: string) {
  const file = require(fileName);

  const jobs: Job[] = [];

  for (const TargetLanguageCode of LANGUAGES) {
    for (const key in file['es']) {
      if (!file[TargetLanguageCode] || !file[TargetLanguageCode][key]) {
        jobs.push({
          SourceLanguageCode: 'en',
          TargetLanguageCode,
          OriginalText: key,
          // When there is an english translation is because we wan to replace the original text
          Text: file['en'] && file['en'][key] ? file['en'][key] : key,
        });
      }
    }
  }

  if (jobs.length > 0) {
    Promise.all(
      jobs.map(({ OriginalText, ...job }) =>
        translate.translateText(job)
      )
    ).then(results => {
      for (let i = 0; i < jobs.length; i++) {
        if (!file[jobs[i].TargetLanguageCode]) {
          file[jobs[i].TargetLanguageCode] = {};
        }
        file[jobs[i].TargetLanguageCode][jobs[i].OriginalText] =
          results[i].TranslatedText;
      }

      const contents = `/* spellchecker: disable */\nmodule.exports = ${JSON.stringify(
        file,
        undefined,
        2
      )}\n`;
      fs.writeFile(fileName, contents, () => {
        console.log(`${fileName} was updated successfully`);
      });
    });
  } else {
    console.log(`Nothing to translate on ${fileName}`);
  }
}

const files = new Glob('**/*.translations.js', { withFileTypes: true });
for (const file of files) {
  translateFile(file.fullpath());
}
