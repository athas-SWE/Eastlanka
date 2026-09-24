import { Component, inject } from '@angular/core';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-whatsapp-float',
  imports: [Icon],
  templateUrl: './whatsapp-float.html',
})
export class WhatsappFloat {
  readonly whatsappUrl = inject(WhatsAppService).generalUrl();
}
