import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNav } from './layout/bottom-nav/bottom-nav';
import { Footer } from './layout/footer/footer';
import { Header } from './layout/header/header';
import { OrderBar } from './layout/order-bar/order-bar';
import { QuickView } from './layout/quick-view/quick-view';
import { WhatsappFloat } from './layout/whatsapp-float/whatsapp-float';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, WhatsappFloat, OrderBar, BottomNav, QuickView],
  templateUrl: './app.html',
})
export class App {}
