import { Component, ElementRef, Input, ViewChild, AfterViewChecked } from '@angular/core';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-ai-chat',
  templateUrl: './ai-chat.component.html',
  styleUrl: './ai-chat.component.css'
})
export class AiChatComponent implements AfterViewChecked {
  @ViewChild('scrollable') scrollableDiv!: ElementRef;

  isMessageLoading = false;
  isChatVisible = false;
  messages: any[] = [];
  inputText: string = '';
  private shouldScroll: boolean = false;

  @Input() category: string = "";
  @Input() question: string = "";
  @Input() type: string = "";
  @Input() userPoint: number = 0;
  @Input() maxPoint: number = 0;

  constructor(private chatService: ChatService) {
    this.isMessageLoading = false;
    this.isChatVisible = false;

    this.messages.push({
      text: "Kérdésed van esetleg? Ne habozz kérdezni, segítek, ahol tudok!", user: false
    });
  }

  toggleChat(event: MouseEvent): void {
    event.stopPropagation();
    this.isChatVisible = !this.isChatVisible;
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.isChatVisible) return;
    const container = document.querySelector('.chat-container');
    if (event.target instanceof Node && !container!.contains(event.target)) {
      this.isChatVisible = false;
    }
  }

  sendMessage(): void {
    if (this.inputText.trim()) {
      this.messages.push({ text: this.inputText, user: true });
      this.shouldScroll = true;
      this.isMessageLoading = true;

      this.chatService.sendMessage(this.category, this.inputText, this.question, this.type, this.userPoint, this.maxPoint).subscribe(
        {
          next: (response) => {
            this.messages.push({ text: response, user: false });
            this.isMessageLoading = false;
            this.shouldScroll = true;
          },
          error: (error) => {
            if (error.error == "CoolDownError") {
              this.messages.push({ text: "FIGYELEM, az üzenetküldések között 1 perces cooldown van életben a visszaélések elkerülése végett!", user: false });
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
