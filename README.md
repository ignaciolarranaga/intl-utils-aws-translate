# intl-utils-aws-translate

This utility generates or populates the translation files used by [intl-utils](https://github.com/ignaciolarranaga/intl-utils) based on AWS Translate.

> Please note you need to have the AWS credentials configured when running the command so they can be used by the utility. See [Setting Credentials in Node.js](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html)

## Usage

1. Install by running `npm i -D intl-util-aws-translate`

2. Add a script to your package.json as follows:
```
"scripts": {
    "translate": "intl-utils-translate ..."
    ...
  },
```

> See below the options for the command

3. Run `npm run translate` to translate all the files in your project.

## Options

**Usage**: intl-util-aws-translate [options]

Where the options are:
* `-V, --version`: output the version number
* `-p, --pattern [pattern]`: the pattern of the files (default: "**/*.translations.js"). The tool supports JS/TS/JSON (i.e. *.js, *.ts and *.json)
* `-f, --from [language]`: the language we are translating from
* `-t, --to [languages...]`: the languages to translate to
* `--no-unchanged`: suppress the log of unchanged files
* `-h, --help`: display help for command

**Example**: `intl-util-aws-translate -f en -t es fr it`

> **Note**: The code for the language/languages (es, en, etc.) are the AWS Translate ones (see supported languages in here: [Supported languages and language codes](https://docs.aws.amazon.com/translate/latest/dg/what-is-languages.html))

> **Note**: When changing the pattern in a shell remember to use quotes to prevent the pattern to expand itself (i.e. *-p "\*\*/\*.translation.js"* not just *-p \*\*/\*.translation.js*)

> **Note**: You can add more keys to an existing file and they will be translated.

## Long Example

Let's suppose you have to translate: `"Hello World!"` and `"loading..."` to *Spanish*, *French* and *Italian* for intl-utils and you want the translations in a JS file.

Then those are the steps you have to follow:

1. **Generate a file** named `sample.translations.js` **with all the keys** as follows:
```
module.exports = {
  "es": {
    "Hello World!": "",
    "loading...": ""
  }
}
```

The structure of the file is:
```
module.exports = {
  LANGUAGE: {
    KEY: TRANSLATED_KEY
  }
}
```
Where *TRANSLATED_KEY* is the translation of *KEY* on *LANGUAGE*

2. **Call the utility**: `intl-util-aws-translate -f en -t es fr it`

> **Note**: The language you use the keys below has to be some of the languages you want to translate to (i.e. in this case es=Spanish, fr=French or it=Italian). The utility will look for all the keys you mentioned in the sample file.

> **Note**: **/*.translations.js is the default pattern for the files so it is not required to be specified in the command.

### JSON Example

Same but the file will be like:
```
{
  LANGUAGE: {
    KEY: TRANSLATED_KEY
  }
}
```

And the command like: `intl-util-aws-translate -f en -t es fr it --pattern "**/*.translations.json"`

### TS Example

Same but the file will be like:
```
export default {
  LANGUAGE: {
    KEY: TRANSLATED_KEY
  }
}
```

And the command like: `intl-util-aws-translate -f en -t es fr it --pattern "**/*.translations.ts"`