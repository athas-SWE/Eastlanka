import { Component, input } from '@angular/core';

@Component({
  selector: 'app-icon',
  host: {
    class: 'inline-flex shrink-0',
    'aria-hidden': 'true',
  },
  template: `
    <svg [attr.viewBox]="brand() ? '0 0 24 24' : '0 0 24 24'" class="h-full w-full" [attr.fill]="brand() ? 'currentColor' : 'none'" [attr.stroke]="brand() ? 'none' : 'currentColor'" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      @switch (name()) {
        @case ('whatsapp') {
          <path d="M20.5 3.5A11 11 0 0 0 2.1 16.7L1 23l6.5-1.1A11 11 0 0 0 20.5 3.5zm-8.5 17a9 9 0 0 1-4.6-1.3l-.3-.2-3.8.6.6-3.7-.2-.3A9 9 0 1 1 12 20.5zm5-6.7c-.3-.1-1.6-.8-1.9-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.3 8.1 8.1 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.5.1-.3a.5.5 0 0 0 0-.5c-.1-.1-.6-1.5-.8-2s-.4-.5-.6-.5h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-1 2.2 5.3 5.3 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4.1 15 15 0 0 0 1.5.5 3.6 3.6 0 0 0 1.6.1 2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3z" />
        }
        @case ('facebook') {
          <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.6l.4-3H13v-2c0-.6.4-1 1-1z" />
        }
        @case ('instagram') {
          <path d="M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5zm8 2H8a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3zm-4 3.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2zm0 1.8a2 2 0 1 0 2 2 2 2 0 0 0-2-2zM17.4 6.2a1 1 0 1 1-1 1 1 1 0 0 1 1-1z" />
        }
        @case ('truck') {
          <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
          <circle cx="7" cy="17" r="1.6" />
          <circle cx="17" cy="17" r="1.6" />
        }
        @case ('plus') {
          <path d="M12 5v14M5 12h14" />
        }
        @case ('grid') {
          <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
        }
        @case ('image') {
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.4" />
          <path d="M7 16l3.2-3.2a1 1 0 0 1 1.4 0L16 17" />
        }
        @case ('box') {
          <path d="M3 8l9-4 9 4-9 4zM3 8v8l9 4 9-4V8" />
          <path d="M12 12v8" />
        }
        @case ('tag') {
          <path d="M4 12V5h7l9 9-7 7z" />
          <circle cx="8.5" cy="8.5" r="1" />
        }
        @case ('percent') {
          <path d="M6 18L18 6" />
          <circle cx="8" cy="8" r="2" />
          <circle cx="16" cy="16" r="2" />
        }
        @case ('logout') {
          <path d="M10 7V5a2 2 0 0 1 2-2h7v18h-7a2 2 0 0 1-2-2v-2" />
          <path d="M4 12h10M11 9l3 3-3 3" />
        }
        @case ('bag') {
          <path d="M6 8h12l-1 12H7L6 8z" />
          <path d="M9 8V7a3 3 0 0 1 6 0v1" />
        }
      }
    </svg>
  `,
})
export class Icon {
  readonly name = input.required<
    | 'whatsapp'
    | 'facebook'
    | 'instagram'
    | 'truck'
    | 'plus'
    | 'grid'
    | 'image'
    | 'box'
    | 'tag'
    | 'percent'
    | 'logout'
    | 'bag'
  >();

  protected brand(): boolean {
    const name = this.name();
    return name === 'whatsapp' || name === 'facebook' || name === 'instagram';
  }
}
