import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATEGORIES } from '../../core/data/categories';
import { SITE_CONFIG } from '../../core/data/site-config';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { CloudinaryUrlPipe } from '../../shared/cloudinary-url.pipe';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, CloudinaryUrlPipe],
  templateUrl: './footer.html',
})
export class Footer {
  readonly site = SITE_CONFIG;
  readonly categories = CATEGORIES;
  readonly year = new Date().getFullYear();
  readonly whatsappUrl = inject(WhatsAppService).generalUrl();
}
