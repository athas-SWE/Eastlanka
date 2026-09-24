import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../core/data/site-config';
import { ProductService } from '../../core/services/product.service';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { CloudinaryUrlPipe } from '../../shared/cloudinary-url.pipe';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, CloudinaryUrlPipe, Icon],
  templateUrl: './footer.html',
})
export class Footer {
  readonly site = SITE_CONFIG;
  readonly categories = inject(ProductService).categories;
  readonly year = new Date().getFullYear();
  readonly whatsappUrl = inject(WhatsAppService).generalUrl();
}
