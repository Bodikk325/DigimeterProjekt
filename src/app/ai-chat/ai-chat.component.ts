import { Component, ElementRef, Input, ViewChild, AfterViewChecked } from '@angular/core';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-ai-chat',
  templateUrl: './ai-chat.component.html',
  styleUrl: './ai-chat.component.css'
})
export class AiChatComponent implements AfterViewChecked {
  @ViewChild('scrollable') scrollableDiv!: ElementRef;

  isSending = false;
  isMessageLoading = false;
  isChatVisible = false;
  messages: any[] = [];
  inputText: string = '';
  private shouldScroll: boolean = false;

  @Input() category: string = "";
  @Input() question: string = "";
  @Input() type: string = "";
  @Input() userPoint: number = 0;
  @Input() firmsPoint: number = 0;

  constructor(private chatService: ChatService) {
    this.isMessageLoading = false;
    this.isChatVisible = false;
    this.isSending = true;
    this.chatService.getMessages().subscribe(
      {
        next: (messages: any) => {
          if (messages.length != 0) {
            messages.forEach((message: any) => {
              var isUser = false;
              if (message.role == "user") {
                isUser = true;
                
              }
              this.messages.push(
                {
                  text: message['content'],
                  user: isUser
                }
              )
            });
          }

          if (this.type == 'result') {
            this.messages.push({
              text: "Kérdése van esetleg az eredménnyel kapcsolatban? Segítek ahol tudok! FIGYELEM! Tudok segíteni az eredmény értelmezésében, viszont nem tudok segíteni önnek egy adott kérdésre kapott pontszámmal kapcsolatban, csak ha tudatja velem a részleteket! Egy példa: 'Az elmúlt egy év során használtak fizetett online hirdetést a következő felületeken?' kérdésre azt válaszoltam, hogy 'Facebook és Google Ads' és csak 21%-ot kaptam, miért van ez szerinted? ", user: false
            });
          }
          else {

            this.messages.push({
              text: "Kérdése van esetleg? Ne habozzon kérdezni, segítek, ahol tudok!", user: false
            });
          }
          this.isSending = false;
        },
        error : () => {
          
          this.isSending = false;
        }
      }

    )
  }

  toggleChat(event: MouseEvent): void {
    event.stopPropagation();
    this.isChatVisible = !this.isChatVisible;
    this.shouldScroll = true;
    this.scrollToBottom();  // Hívás közvetlenül itt
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.isChatVisible) return;
    const container = document.querySelector('.chat-container');
    const targetElement = event.target as Node;
  
    // Ellenőrizd, hogy a kattintás a chat-containeren belül történt-e vagy sem
    if (container && container.contains(targetElement)) {
      return;
    }
  
    this.isChatVisible = false;
  }

  sendMessageWithEnter(): void {
    if (this.inputText.trim()) {
      this.isSending = true;
      this.messages.push({ text: this.inputText, user: true });
      this.shouldScroll = true;
      this.isMessageLoading = true;

      this.chatService.sendMessage(this.category, this.inputText, this.question, this.type, this.userPoint, this.firmsPoint).subscribe(
        {
          next: (response) => {
            this.messages.push({ text: response, user: false });
            this.isMessageLoading = false;
            this.shouldScroll = true;
            this.isSending = false
          },
          error: (error) => {
            this.isSending = false
            if (error.error == "CoolDownError") {
              this.messages.push({ text: "FIGYELEM, az üzenetküldések között 15 másodperces cooldown van életben a visszaélések elkerülése végett!", user: false });
              this.isMessageLoading = false;
              this.shouldScroll = true;
            }
            else if (error.error == "InsufficientCredits") {
              this.messages.push({ text: "FIGYELEM! Elérte a korlátot a beszélgetésben. Kérjük látogasson vissza 3 óra múlva!", user: false });
              this.isMessageLoading = false;
              this.shouldScroll = true;
            }

          }
        }
      );

      this.inputText = '';
    }
  }
  

  sendMessage(event: MouseEvent): void {

    event.stopPropagation();

    
    if (this.inputText.trim()) {
      this.isSending = true;
      this.messages.push({ text: this.inputText, user: true });
      this.shouldScroll = true;
      this.isMessageLoading = true;

      this.chatService.sendMessage(this.category, this.inputText, this.question, this.type, this.userPoint, this.firmsPoint).subscribe(
        {
          next: (response) => {
            this.messages.push({ text: response, user: false });
            this.isMessageLoading = false;
            this.shouldScroll = true;
            this.isSending = false
          },
          error: (error) => {
            this.isSending = false
            if (error.error == "CoolDownError") {
              this.messages.push({ text: "FIGYELEM, az üzenetküldések között 15 másodperces cooldown van életben a visszaélések elkerülése végett!", user: false });
              this.isMessageLoading = false;
              this.shouldScroll = true;
            }
            else if (error.error == "InsufficientCredits") {
              this.messages.push({ text: "FIGYELEM! Elérted a korlátot a beszélgetésben. Kérjük látogass vissza 3 óra múlva!", user: false });
              this.isMessageLoading = false;
              this.shouldScroll = true;
            }

          }
        }
      );

      this.inputText = '';
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  scrollToBottom(): void {
    try {
      this.scrollableDiv.nativeElement.scrollTop = this.scrollableDiv.nativeElement.scrollHeight;
    } catch (err) { }
  }
}
