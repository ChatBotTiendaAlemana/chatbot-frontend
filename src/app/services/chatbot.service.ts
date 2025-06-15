import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = environment.backendUrl;
  private messageHistory: { question: string; answer: string }[] = [];

  constructor(private http: HttpClient) {
    // Limpiar el historial al iniciar la aplicación
    this.clearHistory();
  }

  askQuestion(question: string) {
    return this.http.post<{ answer: string }>(this.apiUrl, { query: question });
  }

  // Método para limpiar el historial de mensajes
  clearHistory() {
    this.messageHistory = [];
    // Limpiar el caché del navegador para esta aplicación
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.includes('chatbot-tienda-alemana')) {
            caches.delete(cacheName);
          }
        });
      });
    }
    // Limpiar el almacenamiento local
    localStorage.removeItem('chatHistory');
    sessionStorage.removeItem('chatHistory');
  }

  // Método para obtener el historial de mensajes
  getMessageHistory() {
    return this.messageHistory;
  }

  // Método para agregar un mensaje al historial
  addMessage(question: string, answer: string) {
    this.messageHistory.push({ question, answer });
  }
}
