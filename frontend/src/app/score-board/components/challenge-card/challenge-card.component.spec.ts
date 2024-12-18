import { type ComponentFixture, TestBed } from '@angular/core/testing'

import { ChallengeCardComponent } from './challenge-card.component'
import { type Config } from 'src/app/Services/configuration.service'
import { TranslateModule } from '@ngx-translate/core'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'
import { EnrichedChallenge } from '../../types/EnrichedChallenge'

describe('ChallengeCard', () => {
  let component: ChallengeCardComponent
  let fixture: ComponentFixture<ChallengeCardComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), MatIconModule, MatTooltipModule],
      declarations: [ChallengeCardComponent]
    })
      .compileComponents()

    fixture = TestBed.createComponent(ChallengeCardComponent)
    component = fixture.componentInstance

    // Correctly typed Challenge object
    component.challenge = {
      category: 'foobar',
      name: 'my name',
      mitigationUrl: 'https://owasp.example.com',
      hasCodingChallenge: true,
      description: 'lorem ipsum',
      tagList: ['Easy'],
      originalDescription: 'Original description',
      key: 'some-key',
      difficulty: 3
    } as EnrichedChallenge

    // Already using the Config type for applicationConfiguration
    component.applicationConfiguration = {
      ctf: {
        showFlagsInNotifications: true
      },
      challenges: {
        codingChallengesEnabled: 'solved'
      },
      hackingInstructor: {
        isEnabled: true
      }
    } as Config

    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should not show a mitigation link when challenge has it but isnt solved', () => {
    component.challenge.solved = false
    component.challenge.mitigationUrl = 'https://owasp.example.com'
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('[aria-label="Vulnerability mitigation link"]'))
      .toBeFalsy()
  })

  it('should show a mitigation link when challenge has it and is solved', () => {
    component.challenge.solved = true
    component.challenge.mitigationUrl = 'https://owasp.example.com'
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('[aria-label="Vulnerability mitigation link"]'))
      .toBeTruthy()
  })
})