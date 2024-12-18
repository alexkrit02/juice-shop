/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { ClipboardModule } from 'ngx-clipboard'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { CountryMappingService } from '../Services/country-mapping.service'
import { CookieModule, CookieService } from 'ngx-cookie'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { ChallengeService } from '../Services/challenge.service'
import { ConfigurationService, Config } from '../Services/configuration.service'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { type ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing'
import { SocketIoService } from '../Services/socket-io.service'
import { Socket } from 'socket.io-client';

import { ChallengeSolvedNotificationComponent } from './challenge-solved-notification.component'
import { of, throwError } from 'rxjs'
import { EventEmitter } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'

class MockSocket {
  on (_: string, callback: () => void) {
    callback()
  }

  emit () {
    return null
  }
}

const mockConfig: Config = {
  server: { port: 3000 },
  application: {
    domain: 'localhost',
    name: 'Juice Shop',
    logo: 'logo.png',
    favicon: 'favicon.ico',
    theme: 'dark',
    showVersionNumber: true,
    showGitHubLinks: false,
    localBackupEnabled: true,
    numberOfRandomFakeUsers: 10,
    altcoinName: 'JuiceCoin',
    privacyContactEmail: 'privacy@juiceshop.com',
    social: {
      twitterUrl: 'https://twitter.com/juiceshop',
      facebookUrl: 'https://facebook.com/juiceshop',
      slackUrl: 'https://slack.com/juiceshop',
      redditUrl: 'https://reddit.com/r/juiceshop',
      pressKitUrl: 'https://juiceshop.com/presskit',
      nftUrl: 'https://juiceshop.com/nft',
      questionnaireUrl: 'https://juiceshop.com/questionnaire'
    },
    recyclePage: {
      topProductImage: 'top.png',
      bottomProductImage: 'bottom.png'
    },
    welcomeBanner: {
      showOnFirstStart: true,
      title: 'Welcome to Juice Shop',
      message: 'Enjoy your stay!'
    },
    cookieConsent: {
      message: 'We use cookies',
      dismissText: 'Got it!',
      linkText: 'Learn more',
      linkUrl: 'https://juiceshop.com/cookies'
    },
    securityTxt: {
      contact: 'security@juiceshop.com',
      encryption: 'encryption-key',
      acknowledgements: 'Thanks to all contributors'
    },
    promotion: {
      video: 'promo.mp4',
      subtitles: 'promo.srt'
    },
    easterEggPlanet: {
      name: 'Juice Planet',
      overlayMap: 'map.png'
    },
    googleOauth: {
      clientId: 'google-client-id',
      authorizedRedirects: ['https://juiceshop.com/oauth']
    }
  },
  challenges: {
    showSolvedNotifications: true,
    showHints: true,
    showMitigations: true,
    codingChallengesEnabled: 'all',
    restrictToTutorialsFirst: false,
    safetyMode: 'strict',
    overwriteUrlForProductTamperingChallenge: 'https://juiceshop.com/tampering',
    showFeedbackButtons: true
  },
  hackingInstructor: {
    isEnabled: true,
    avatarImage: 'avatar.png'
  },
  products: [],
  memories: [],
  ctf: {
    showFlagsInNotifications: true,
    showCountryDetailsInNotifications: 'all',
    countryMapping: []
  }
};

describe('ChallengeSolvedNotificationComponent', () => {
  let component: ChallengeSolvedNotificationComponent;
  let fixture: ComponentFixture<ChallengeSolvedNotificationComponent>;
  let socketIoService: jasmine.SpyObj<SocketIoService>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let cookieService: jasmine.SpyObj<CookieService>;
  let challengeService: jasmine.SpyObj<ChallengeService>;
  let configurationService: jasmine.SpyObj<ConfigurationService>;
  let mockSocket: MockSocket;

  beforeEach(waitForAsync(() => {
    mockSocket = new MockSocket()
    socketIoService = jasmine.createSpyObj('SocketIoService', ['socket'])
    socketIoService.socket.and.returnValue(mockSocket as unknown as Socket)
    translateService = jasmine.createSpyObj('TranslateService', ['get'])
    translateService = jasmine.createSpyObj('TranslateService', ['get'], {
      onLangChange: new EventEmitter(),
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter()
    });
    cookieService = jasmine.createSpyObj('CookieService', ['put'])
    challengeService = jasmine.createSpyObj('ChallengeService', ['continueCode'])
    configurationService = jasmine.createSpyObj('ConfigurationService', ['getApplicationConfiguration'])
    configurationService.getApplicationConfiguration.and.returnValue(of(mockConfig))

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        CookieModule.forRoot(),
        ClipboardModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule
      ],
      declarations: [ChallengeSolvedNotificationComponent],
      providers: [
        { provide: SocketIoService, useValue: socketIoService },
        { provide: TranslateService, useValue: translateService },
        { provide: CookieService, useValue: cookieService },
        { provide: ChallengeService, useValue: challengeService },
        { provide: ConfigurationService, useValue: configurationService },
        CountryMappingService
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ChallengeSolvedNotificationComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should delete notifictions', () => {
    component.notifications = [
      { message: 'foo', flag: '1234', copied: false },
      { message: 'bar', flag: '5678', copied: false }
    ]
    component.closeNotification(0)

    expect(component.notifications).toEqual([{ message: 'bar', flag: '5678', copied: false }])
  })

  it('should delete all notifications if the shiftKey was pressed', () => {
    component.notifications = [
      { message: 'foo', flag: '1234', copied: false },
      { message: 'bar', flag: '5678', copied: false }
    ]
    component.closeNotification(0, true)

    expect(component.notifications).toEqual([])
  })

  it('should add new notification', fakeAsync(() => {
    translateService.get.and.returnValue(of('CHALLENGE_SOLVED'))
    component.notifications = []
    component.showNotification({ challenge: 'Test', flag: '1234' })
    tick()

    expect(translateService.get).toHaveBeenCalledWith('CHALLENGE_SOLVED', { challenge: 'Test' })
    expect(component.notifications).toEqual([{ message: 'CHALLENGE_SOLVED', flag: '1234', copied: false, country: undefined }])
  }))

  it('should store retrieved continue code as cookie for 1 year', () => {
    challengeService.continueCode.and.returnValue(of('12345'))

    const expires = new Date()
    component.saveProgress()
    expires.setFullYear(expires.getFullYear() + 1)

    expect(cookieService.put).toHaveBeenCalledWith('continueCode', '12345', { expires })
  })

  it('should throw error when not supplied with a valid continue code', () => {
    challengeService.continueCode.and.returnValue(of(undefined))
    console.log = jasmine.createSpy('log')

    expect(component.saveProgress).toThrow()
  })

  it('should log error from continue code API call directly to browser console', fakeAsync(() => {
    challengeService.continueCode.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.saveProgress()
    fixture.detectChanges()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))

  it('should show CTF flag codes if configured accordingly', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of(mockConfig))
    component.ngOnInit()

    expect(component.showCtfFlagsInNotifications).toBeTrue()
  })

  it('should hide CTF flag codes if configured accordingly', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of(mockConfig))
    component.ngOnInit()

    expect(component.showCtfFlagsInNotifications).toBeFalse()
  })

  it('should hide CTF flag codes by default', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of(mockConfig))
    component.ngOnInit()

    expect(component.showCtfFlagsInNotifications).toBeFalse()
  })

  it('should hide FBCTF-specific country details by default', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of(mockConfig))
    component.ngOnInit()

    expect(component.showCtfCountryDetailsInNotifications).toBe('none')
  })

  it('should not load countries for FBCTF when configured to hide country details', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of(mockConfig))
    component.ngOnInit()

    expect(component.showCtfCountryDetailsInNotifications).toBe('none')
    expect(component.countryMap).toBeUndefined()
  })
})
