import { Component, inject } from '@angular/core';
import { SITE_CONFIG } from '../../core/data/site-config';
import { WhatsAppService } from '../../core/services/whatsapp.service';

@Component({
  selector: 'app-contact',
  imports: [],
  templateUrl: './contact.html',
})
export class Contact {
  readonly site = SITE_CONFIG;
  readonly whatsappUrl = inject(WhatsAppService).generalUrl();
}
