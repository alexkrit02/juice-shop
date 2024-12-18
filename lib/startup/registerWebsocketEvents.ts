/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config from 'config'
import * as utils from '../utils'
import { Server as SocketIOServer, Socket } from 'socket.io'
import { notifications, challenges, Notification } from '../../data/datacache'
import * as challengeUtils from '../challengeUtils'
import * as security from '../insecurity'
import { Server as HTTPServer } from 'http';

let firstConnectedSocket: string | null = null

const globalWithSocketIO = global as typeof globalThis & {
  io: SocketIOServer;
}

const registerWebsocketEvents = (server: HTTPServer) => {
  const io = new SocketIOServer(server, { cors: { origin: 'http://localhost:4200' } })
  // @ts-expect-error FIXME Type safety issue when setting global socket-io object
  globalWithSocketIO.io = io

  io.on('connection', (socket: Socket) => {
    if (firstConnectedSocket === null) {
      socket.emit('server started')
      firstConnectedSocket = socket.id
    }

    notifications.forEach((notification: Notification) => {
      socket.emit('challenge solved', notification)
    })

    socket.on('notification received', (data: string) => {
      const i = notifications.findIndex(({ flag }: Notification) => flag === data)
      if (i > -1) {
        notifications.splice(i, 1)
      }
    })

    socket.on('verifyLocalXssChallenge', (data: string) => {
      challengeUtils.solveIf(challenges.localXssChallenge, () => { return utils.contains(data, '<iframe src="javascript:alert(`xss`)">') })
      challengeUtils.solveIf(challenges.xssBonusChallenge, () => { return utils.contains(data, config.get('challenges.xssBonusPayload')) })
    })

    socket.on('verifySvgInjectionChallenge', (data: string) => {
      challengeUtils.solveIf(challenges.svgInjectionChallenge, () => { return !!data.match(/.*\.\.\/\.\.\/\.\.[\w/-]*?\/redirect\?to=https?:\/\/placekitten.com\/(g\/)?[\d]+\/[\d]+.*/) && security.isRedirectAllowed(data) })
    })

    socket.on('verifyCloseNotificationsChallenge', (data: typeof notifications) => {
      challengeUtils.solveIf(challenges.closeNotificationsChallenge, () => { return Array.isArray(data) && data.length > 1 })
    })
  })
}

export default registerWebsocketEvents
