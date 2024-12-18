/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { UserService } from '../Services/user.service'
import { Component, Inject, type OnInit } from '@angular/core'
import { MAT_DIALOG_DATA } from '@angular/material/dialog'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowCircleLeft } from '@fortawesome/free-solid-svg-icons'
// import { Model } from 'sequelize'

library.add(faArrowCircleLeft)

interface DialogData {
  id: number
}

interface user{
  id: number;
  username: string;
  email: string;
  password: string,
  role: string;
  deluxeToken?: string; 
  lastLoginIp?: string;
  profileImage?: string;
  totpSecret?: string;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit {
  public user: user
  constructor (@Inject(MAT_DIALOG_DATA) public dialogData: DialogData, private readonly userService: UserService) { }

  ngOnInit () {
    this.userService.get(this.dialogData.id).subscribe((user) => {
      this.user = user
    }, (err) => { console.log(err) })
  }
}