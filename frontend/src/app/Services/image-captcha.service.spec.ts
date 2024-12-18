/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'
import { ImageCaptchaService } from './image-captcha.service'

interface ApplicationVersionResponse {
  version: string;
}

describe('ImageCaptchaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ImageCaptchaService]
    })
  })

  it('should be created', inject([ImageCaptchaService], (service: ImageCaptchaService) => {
    expect(service).toBeTruthy()
  }))

  it('should get captcha directly from the rest api', inject([ImageCaptchaService, HttpTestingController],
    fakeAsync((service: ImageCaptchaService, httpMock: HttpTestingController) => {
      let res: ApplicationVersionResponse | undefined
      service.getCaptcha().subscribe((data: ApplicationVersionResponse) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/rest/image-captcha/')
      req.flush('apiResponse')

      tick()
      expect(req.request.method).toBe('GET')
      expect(res?.version).toBe('apiResponse')
      httpMock.verify()
    })
  ))
})
