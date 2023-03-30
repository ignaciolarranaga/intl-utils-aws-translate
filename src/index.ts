import fs from 'fs';
import { Glob } from 'glob';
import AWS from 'aws-sdk';

const translate = new AWS.Translate();
const LANGUAGES = ['es', 'fr', 'it', 'pt'];

interface Job {
  SourceLanguageCode: string,
  TargetLanguageCode: string,
  OriginalText: string,
  Text: string,
}

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
        translate.translateText(job).promise()
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

const files = new Glob('**/*.translations.js', {});
for (const file of files) {
  console.log('found a foo file:', file);
  //translateFile(file);
}
