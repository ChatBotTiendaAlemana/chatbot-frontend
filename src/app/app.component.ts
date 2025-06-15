import { Component } from '@angular/core';
import { ChatbotComponent } from './components/chatbot/chatbot.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChatbotComponent],
  template: `<app-chatbot></app-chatbot>`
})
export class AppComponent {}
