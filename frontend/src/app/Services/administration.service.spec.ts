/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'

import { AdministrationService } from './administration.service'

interface ApplicationVersionResponse {
  version: string;
}

describe('AdministrationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdministrationService]
    })
  })

  it('should be created', inject([AdministrationService], (service: AdministrationService) => {
    expect(service).toBeTruthy()
  }))

  it('should get application version directly from the rest api', inject([AdministrationService, HttpTestingController],
    fakeAsync((service: AdministrationService, httpMock: HttpTestingController) => {
      let res: ApplicationVersionResponse | undefined
      service.getApplicationVersion().subscribe((data: ApplicationVersionResponse) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/rest/admin/application-version')
      req.flush({ version: 'apiResponse' })
      tick()

      expect(req.request.method).toBe('GET')
      expect(res?.version).toBe('apiResponse')
      httpMock.verify()
    })
  ))
})
