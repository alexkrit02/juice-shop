import locales from '../data/static/locales.json'
import fs from 'fs'
import { type Request, type Response, type NextFunction } from 'express'

interface LanguageFileContent {
  [key: string]: string
  LANGUAGE: string
}

interface Language {
  key: string
  lang: string
  icons: string[]
  shortKey: string
  percentage: number
  gauge: string
}

export default function getLanguageList() {
  return (req: Request, res: Response, next: NextFunction) => {
    const languages: Language[] = []
    let count = 0
    let enContent: LanguageFileContent

    fs.readFile('frontend/dist/frontend/assets/i18n/en.json', 'utf-8', (err, content) => {
      if (err != null) {
        next(new Error(`Unable to retrieve en.json language file: ${err.message}`))
        return
      }
      enContent = JSON.parse(content)
      fs.readdir('frontend/dist/frontend/assets/i18n/', (err, languageFiles) => {
        if (err != null) {
          next(new Error(`Unable to read i18n directory: ${err.message}`))
          return
        }
        languageFiles.forEach((fileName) => {
          fs.readFile('frontend/dist/frontend/assets/i18n/' + fileName, 'utf-8', async (err, content) => {
            if (err != null) {
              next(new Error(`Unable to retrieve ${fileName} language file: ${err.message}`))
              return
            }
            const fileContent: LanguageFileContent = JSON.parse(content)
            const percentage = await calcPercentage(fileContent, enContent)
            const key = fileName.substring(0, fileName.indexOf('.'))
            const locale = locales.find((l) => l.key === key)
            const lang: Language = {
              key,
              lang: fileContent.LANGUAGE,
              icons: locale?.icons || [],
              shortKey: locale?.shortKey || '',
              percentage,
              gauge: (percentage > 90 ? 'full' : (percentage > 70 ? 'three-quarters' : (percentage > 50 ? 'half' : (percentage > 30 ? 'quarter' : 'empty'))))
            }
            if (!(fileName === 'en.json' || fileName === 'tlh_AA.json')) {
              languages.push(lang)
            }
            count++
            if (count === languageFiles.length) {
              languages.push({ key: 'en', icons: ['gb', 'us'], shortKey: 'EN', lang: 'English', percentage: 100, gauge: 'full' })
              languages.sort((a, b) => a.lang.localeCompare(b.lang))
              res.status(200).json(languages)
            }
          })
        })
      })
    })

    async function calcPercentage(fileContent: LanguageFileContent, enContent: LanguageFileContent): Promise<number> {
      const totalStrings = Object.keys(enContent).length
      let differentStrings = 0
      try {
        for (const key in fileContent) {
          if (Object.prototype.hasOwnProperty.call(fileContent, key) && fileContent[key] !== enContent[key]) {
            differentStrings++
          }
        }
        return (differentStrings / totalStrings) * 100
      } catch (err) {
        throw new Error('Error calculating percentage')
      }
    }
  }
}