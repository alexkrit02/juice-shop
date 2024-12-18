/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { ConfigurationService, Config } from '../Services/configuration.service'
import { Component, type OnInit } from '@angular/core'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faBitcoin } from '@fortawesome/free-brands-svg-icons'
import { faCommentAlt, faComments, faGraduationCap, faUniversity } from '@fortawesome/free-solid-svg-icons'
import { faCommentAlt as farCommentAlt, faComments as farComments } from '@fortawesome/free-regular-svg-icons'

library.add(faBitcoin, faUniversity, faGraduationCap, faCommentAlt, faComments, farCommentAlt, farComments)

@Component({
  selector: 'app-token-sale',
  templateUrl: './token-sale.component.html',
  styleUrls: ['./token-sale.component.scss']
})
export class TokenSaleComponent implements OnInit {
  public altcoinName = 'Juicycoin'
  constructor (private readonly configurationService: ConfigurationService) { }

  ngOnInit () {
    this.configurationService.getApplicationConfiguration().subscribe((config: Config) => {
      if (config?.application?.altcoinName) {
        this.altcoinName = config.application.altcoinName
      }
    }, (err) => { console.log(err) })
  }
}
