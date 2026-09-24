import { Component, inject } from '@angular/core';
import { SITE_CONFIG } from '../../core/data/site-config';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-contact',
  imports: [Icon],
  templateUrl: './contact.html',
})
export class Contact {
  readonly site = SITE_CONFIG;
  readonly whatsappUrl = inject(WhatsAppService).generalUrl();
}
