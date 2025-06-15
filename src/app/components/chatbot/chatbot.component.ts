import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../services/chatbot.service';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements AfterViewInit, OnInit {
  @ViewChild('chatWindow') chatWindowRef!: ElementRef;

  question = '';
  loading = false;
  messages: Message[] = [];
  sessions: Message[][] = [];
  sessionTitles: string[] = [];
  selectedSessionIndex: number | null = null;

  constructor(private chatbotService: ChatbotService) {}

  ngOnInit() {
    // Limpiar el caché al iniciar
    this.clearAllData();
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  // Método para limpiar todos los datos
  clearAllData() {
    this.messages = [];
    this.sessions = [];
    this.sessionTitles = [];
    this.selectedSessionIndex = null;
    this.question = '';

    // Limpiar el almacenamiento local
    localStorage.removeItem('chatbot-current');
    localStorage.removeItem('chatbot-sessions');
    localStorage.removeItem('chatbot-titles');

    // Limpiar el caché del servicio
    this.chatbotService.clearHistory();
  }

  sendQuestion() {
    const trimmed = this.question.trim();
    if (!trimmed) return;

    if (this.messages.length === 0) {
      this.sessionTitles.push(trimmed);
    }

    this.messages.push({ sender: 'user', text: trimmed });
    this.saveCurrentSession();
    this.loading = true;

    this.chatbotService.askQuestion(trimmed).subscribe({
      next: (res) => {
        this.messages.push({ sender: 'bot', text: res.answer });
        this.saveCurrentSession();
        this.loading = false;
        this.question = '';
        this.scrollToBottom();
      },
      error: () => {
        this.messages.push({ sender: 'bot', text: 'Ocurrió un error al obtener la respuesta.' });
        this.saveCurrentSession();
        this.loading = false;
        this.scrollToBottom();
      }
    });
  }

  startNewChat() {
    if (this.messages.length > 0) {
      // Verificar si la conversación actual ya existe en las sesiones
      const currentChatExists = this.sessions.some(session =>
        session.length === this.messages.length &&
        session.every((msg, index) =>
          msg.sender === this.messages[index].sender &&
          msg.text === this.messages[index].text
        )
      );

      // Solo agregar la conversación si no existe
      if (!currentChatExists) {
        this.sessions.push([...this.messages]);

        if (this.sessionTitles.length < this.sessions.length) {
          this.sessionTitles.push(this.messages[0]?.text || `Chat ${this.sessions.length}`);
        }

        localStorage.setItem('chatbot-sessions', JSON.stringify(this.sessions));
        localStorage.setItem('chatbot-titles', JSON.stringify(this.sessionTitles));
      }
    }

    this.messages = [];
    this.selectedSessionIndex = null;
    this.question = '';
    this.saveCurrentSession();
  }

  loadSession(index: number) {
    if (this.messages.length > 0) {
      if (this.selectedSessionIndex !== null) {
        this.sessions[this.selectedSessionIndex] = [...this.messages];
      } else {
        this.sessions.push([...this.messages]);
        this.sessionTitles.push(this.messages[0]?.text || `Chat ${this.sessions.length}`);
      }

      localStorage.setItem('chatbot-sessions', JSON.stringify(this.sessions));
      localStorage.setItem('chatbot-titles', JSON.stringify(this.sessionTitles));
    }

    const saved = localStorage.getItem('chatbot-sessions');
    const titles = localStorage.getItem('chatbot-titles');

    if (saved && titles) {
      this.sessions = JSON.parse(saved);
      this.sessionTitles = JSON.parse(titles);

      if (this.sessions[index]) {
        this.messages = [...this.sessions[index]];
        this.selectedSessionIndex = index;
        this.saveCurrentSession();
      }
    }

    this.scrollToBottom();
  }

  deleteSession(index: number) {
    this.sessions.splice(index, 1);
    this.sessionTitles.splice(index, 1);
    localStorage.setItem('chatbot-sessions', JSON.stringify(this.sessions));
    localStorage.setItem('chatbot-titles', JSON.stringify(this.sessionTitles));
    if (this.selectedSessionIndex === index) {
      this.messages = [];
      this.selectedSessionIndex = null;
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      const el = this.chatWindowRef?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 100);
  }

  saveCurrentSession() {
    if (this.selectedSessionIndex !== null) {
      this.sessions[this.selectedSessionIndex] = [...this.messages];
    }

    localStorage.setItem('chatbot-current', JSON.stringify(this.messages));
    localStorage.setItem('chatbot-sessions', JSON.stringify(this.sessions));
    localStorage.setItem('chatbot-titles', JSON.stringify(this.sessionTitles));
  }

  loadSessions() {
    const current = localStorage.getItem('chatbot-current');
    const saved = localStorage.getItem('chatbot-sessions');
    const titles = localStorage.getItem('chatbot-titles');

    if (current) {
      this.messages = JSON.parse(current);
    }
    if (saved) {
      this.sessions = JSON.parse(saved);
    }
    if (titles) {
      this.sessionTitles = JSON.parse(titles);
    }
  }
}
