/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule } from '@ngx-translate/core'
import { MatInputModule } from '@angular/material/input'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatDialogModule } from '@angular/material/dialog'
import { type ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { BasketComponent } from './basket.component'
import { MatCardModule } from '@angular/material/card'
import { MatTableModule } from '@angular/material/table'
import { MatButtonModule } from '@angular/material/button'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { ReactiveFormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { RouterTestingModule } from '@angular/router/testing'
import { PurchaseBasketComponent } from '../purchase-basket/purchase-basket.component'
import { DeluxeGuard } from '../app.guard'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'

describe('BasketComponent', () => {
  let component: BasketComponent
  let fixture: ComponentFixture<BasketComponent>
  let deluxeGuard: jasmine.SpyObj<DeluxeGuard>
  let snackBar: jasmine.SpyObj<MatSnackBar>

  beforeEach(waitForAsync(() => {
    deluxeGuard = jasmine.createSpyObj('DeluxeGuard', ['canActivate'])
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open'])

    TestBed.configureTestingModule({
      declarations: [BasketComponent, PurchaseBasketComponent],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatTableModule,
        MatButtonModule,
        MatExpansionModule,
        MatDialogModule,
        MatButtonToggleModule,
        MatSnackBarModule
      ],
      providers: [
        { provide: DeluxeGuard, useValue: deluxeGuard },
        { provide: MatSnackBar, useValue: snackBar }
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BasketComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should store product count on calling getProductCount', () => {
    component.getProductCount(1)
    expect(component.productCount).toBe(1)
  })

  it('should store bonus points on calling getBonusPoints', () => {
    component.getBonusPoints([1, 10])
    expect(component.bonus).toBe(10)
  })

  it('should store itemTotal in session storage', () => {
    spyOn(sessionStorage, 'setItem')
    const bonus = 1
    component.getBonusPoints([bonus, 10])
    expect(sessionStorage.setItem).toHaveBeenCalledWith('itemTotal', bonus.toString())
  })
})
