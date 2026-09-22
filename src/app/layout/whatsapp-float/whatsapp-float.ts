import { Component, inject } from '@angular/core';
import { WhatsAppService } from '../../core/services/whatsapp.service';

@Component({
  selector: 'app-whatsapp-float',
  templateUrl: './whatsapp-float.html',
})
export class WhatsappFloat {
  readonly whatsappUrl = inject(WhatsAppService).generalUrl();
}
