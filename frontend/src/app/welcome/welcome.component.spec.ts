/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule } from '@ngx-translate/core'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { CookieModule, CookieService } from 'ngx-cookie'

import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { Config } from '../Services/configuration.service'
import { WelcomeComponent } from './welcome.component'
import { of } from 'rxjs'
import { ConfigurationService } from '../Services/configuration.service'


describe('WelcomeComponent', () => {
  let component: WelcomeComponent
  let configurationService: jasmine.SpyObj<ConfigurationService>
  let cookieService: CookieService
  let fixture: ComponentFixture<WelcomeComponent>
  let dialog: jasmine.SpyObj<MatDialog>

  beforeEach(() => {
    configurationService = jasmine.createSpyObj('ConfigurationService', ['getApplicationConfiguration'])
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: {} } as Config))
    dialog = jasmine.createSpyObj('MatDialog', ['open'])
    dialog.open.and.returnValue(null)

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        CookieModule.forRoot(),
        HttpClientTestingModule,
        MatDialogModule
      ],
      declarations: [WelcomeComponent],
      providers: [
        { provide: ConfigurationService, useValue: configurationService },
        { provide: MatDialog, useValue: dialog },
        CookieService
      ]
    })
      .compileComponents()

    cookieService = TestBed.inject(CookieService)
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeComponent)
    component = fixture.componentInstance
    cookieService.remove('welcomebanner_status')
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should open the welcome banner dialog if configured to show on start', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { welcomeBanner: { showOnFirstStart: true } } } as Config))
    component.ngOnInit()
    expect(dialog.open).toHaveBeenCalled()
  })

  it('should not open the welcome banner dialog if configured to not show on start', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { welcomeBanner: { showOnFirstStart: false } } }  as Config))
    component.ngOnInit()
    expect(dialog.open).not.toHaveBeenCalled()
  })

  it('should not open the welcome banner dialog if previously dismissed', () => {
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: { welcomeBanner: { showOnFirstStart: true } } } as Config))
    cookieService.put('welcomebanner_status', 'dismiss')
    component.ngOnInit()
    expect(dialog.open).not.toHaveBeenCalled()
  })
})
