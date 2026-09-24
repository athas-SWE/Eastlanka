import { Component, inject } from '@angular/core';
import { SITE_CONFIG } from '../../core/data/site-config';
import { SeoService } from '../../core/services/seo.service';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-contact',
  imports: [Icon],
  templateUrl: './contact.html',
})
export class Contact {
  private readonly seo = inject(SeoService);
  readonly site = SITE_CONFIG;
  readonly whatsappUrl = inject(WhatsAppService).generalUrl();

  constructor() {
    this.seo.apply({
      title: 'Contact | East Lanka',
      description: 'Contact East Lanka on WhatsApp, Facebook or Instagram to ask about stock and delivery in Sri Lanka.',
      path: '/contact',
    });
  }
}
