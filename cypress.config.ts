import { defineConfig } from 'cypress'
import * as security from './lib/insecurity'
import config from 'config'
import type { Memory as MemoryConfig, Product as ProductConfig } from './lib/config.types'
import * as utils from './lib/utils'
import * as otplib from 'otplib'

export default defineConfig({
  projectId: '3hrkhu',
  defaultCommandTimeout: 10000,
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'test/cypress/e2e/**.spec.ts',
    downloadsFolder: 'test/cypress/downloads',
    fixturesFolder: false,
    supportFile: 'test/cypress/support/e2e.ts',
    setupNodeEvents (on: Cypress.PluginEvents) {
      on('before:browser:launch', (browser: Cypress.Browser, launchOptions:  Cypress.BeforeBrowserLaunchOptions) => { // TODO Remove after upgrade to Cypress >=12.5.0 <or> Chrome 119 become available on GitHub Workflows, see https://github.com/cypress-io/cypress-documentation/issues/5479
        if (browser.name === 'chrome' && browser.isHeadless) {
          launchOptions.args = launchOptions.args.map((arg: string) => {
            if (arg === '--headless') {
              return '--headless=new'
            }

            return arg
          })
        }
        return launchOptions
      })

      on('task', {
        GenerateCoupon (discount: number) {
          return security.generateCoupon(discount)
        },
        GetBlueprint () {
          const products = config.get<ProductConfig[]>('products');
          for (const product of products) {
            if (product.fileForRetrieveBlueprintChallenge) {
              const blueprint = product.fileForRetrieveBlueprintChallenge
              return blueprint
            }
          }
        },
        GetChristmasProduct () {
          return config.get<ProductConfig[]>('products').filter(
            (product) => product.useForChristmasSpecialChallenge
          )[0]
        },
        async GetCouponIntent () {
          const trainingData = await import(
            `data/chatbot/${utils.extractFilename(config.get('application.chatBot.trainingData'))}`
          );
          const couponIntent = trainingData.data.filter(
            (data: { intent: string }) => data.intent === 'queries.couponCode'
          )[0]
          return couponIntent
        },
        GetFromMemories (property: keyof MemoryConfig) {
          const memories = config.get<MemoryConfig[]>('memories');
          for (const memory of memories) {
            if (memory[property]) {
              return memory[property]
            }
          }
        },
        GetFromConfig (variable: string) {
          return config.get(variable)
        },
        GetOverwriteUrl () {
          return config.get('challenges.overwriteUrlForProductTamperingChallenge')
        },
        GetPastebinLeakProduct () {
          return config.get<ProductConfig[]>('products').filter(
            (product) => product.keywordsForPastebinDataLeakChallenge
          )[0]
        },
        GetTamperingProductId () {
          const products = config.get<ProductConfig[]>('products')
          for (let i = 0; i < products.length; i++) {
            if (products[i].urlForProductTamperingChallenge) {
              return i + 1
            }
          }
        },
        GenerateAuthenticator (inputString: string) {
          return otplib.authenticator.generate(inputString)
        },
        toISO8601 () {
          const date = new Date()
          return utils.toISO8601(date)
        },
        isDocker () {
          return utils.isDocker()
        },
        isWindows () {
          return utils.isWindows()
        }
      })
    }
  }
})
