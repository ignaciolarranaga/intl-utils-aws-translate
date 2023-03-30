# intl-utils-aws-translate

This utility generates or populates the translation files used by [intl-utils](https://github.com/ignaciolarranaga/intl-utils) based on AWS Translate.

> Please notice you need to have the AWS credentials configured when running the command so they can be used by the utility. See [Setting Credentials in Node.js](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html)

**Usage**: intl-util-aws-translate [options]

Where the options are:
* `-V, --version`: output the version number
* `-f, --from [language]`: the language we are translating from
* `-t, --to [languages...]`: the languages to translate to
* `-h, --help`: display help for command

**Example**: `intl-util-aws-translate -f en -t es fr it`

> **Note**: The code for the language/languages (es, en, etc.) are the AWS Translate ones (see supported languages in here: [Supported languages and language codes](https://docs.aws.amazon.com/translate/latest/dg/what-is-languages.html))

> **Note**: You can add more keys to an existing file and they will be translated.

## Long Example

Let's suppose you have to translate: `"Hello World!"` and `"loading..."` to *Spanish*, *French* and *Italian* for intl-utils.

Then those are the steps you have to follow:

1. **Generate a file** named `*.translations.js` **with all the keys** as follows:
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
