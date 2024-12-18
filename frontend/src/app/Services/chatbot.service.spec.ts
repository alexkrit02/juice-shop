/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing'

import { ChatbotService } from './chatbot.service'

interface ChatbotStatusResponse {
  status: boolean;
  body: string;
}

interface ChatbotQueryResponse {
  action: string;
  body: string;
}

describe('ChatbotService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ChatbotService]
    })
  })

  it('should be created', inject([ChatbotService], (service: ChatbotService) => {
    expect(service).toBeTruthy()
  }))

  it('should get status from the REST API', inject([ChatbotService, HttpTestingController],
    fakeAsync((service: ChatbotService, httpMock: HttpTestingController) => {
      let res: ChatbotStatusResponse | undefined
      service.getChatbotStatus().subscribe((data: ChatbotStatusResponse) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/rest/chatbot/status')
      req.flush({ status: true, body: 'apiResponse' })

      tick()
      expect(req.request.method).toBe('GET')
      expect(req.request.body).toBeNull()
      expect(res?.status).toBeTrue()
      expect(res?.body).toBe('apiResponse')
      httpMock.verify()
    })
  ))

  it('should get query response from the REST API', inject([ChatbotService, HttpTestingController],
    fakeAsync((service: ChatbotService, httpMock: HttpTestingController) => {
      let res: ChatbotQueryResponse | undefined
      service.getResponse('query', 'apiQuery').subscribe((data: ChatbotQueryResponse) => (res = data))
      const req = httpMock.expectOne('http://localhost:3000/rest/chatbot/respond')
      req.flush({ action: 'response', body: 'apiResponse' })

      tick()
      expect(req.request.method).toBe('POST')
      expect(req.request.body.query).toBe('apiQuery')
      expect(res?.action).toBe('response')
      expect(res?.body).toBe('apiResponse')
      httpMock.verify()
    })
  ))
})
