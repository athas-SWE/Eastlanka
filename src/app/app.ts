import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './layout/footer/footer';
import { Header } from './layout/header/header';
import { WhatsappFloat } from './layout/whatsapp-float/whatsapp-float';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, WhatsappFloat],
  templateUrl: './app.html',
})
export class App {}
