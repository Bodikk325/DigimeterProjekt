import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Input, ViewChild, AfterViewInit, AfterViewChecked, AfterContentInit, OnInit, afterNextRender, Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-floating-icon',
  templateUrl: './floating-icon.component.html',
  styleUrls: ['./floating-icon.component.css']
})
export class FloatingIconComponent implements OnInit {
  @ViewChild('scrollable') scrollableDiv!: ElementRef;
  scrollableElement: any;
  @Input() messages: string[] = [];
  shownMessages: string[] = [];
  @Input() tutorialName: string = "";

  isMessageLoading = false;
  isChatVisible = false;
  typingIndicator = "typing-indicator";

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {

      const isTutorial = JSON.parse(localStorage.getItem(this.tutorialName) || 'false');
      if (isTutorial) {
        this.shownMessages = [...this.messages];
        setTimeout(() => this.scrollToBottom(), 0)
      } else {
        this.isChatVisible = true;
        
        this.displayMessages();
      }
    }
  }

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
   
  }

  ngAfterViewInit() {
    this.scrollToBottom(); // Ensure scroll after view is initialized
  }

  displayMessages() {
    let index = 1;
    this.shownMessages.push(this.messages[0])
    this.shownMessages.push(this.typingIndicator);
    const intervalId = setInterval(() => {
      if (index < this.messages.length) {
        if (this.shownMessages.length > 0 && this.shownMessages[this.shownMessages.length - 1] === this.typingIndicator) {
          this.shownMessages.pop(); // Remove typing indicator before adding the real message
        }
        this.shownMessages.push(this.messages[index]);
        index++;
        if (index < this.messages.length) {
          this.shownMessages.push(this.typingIndicator); // Add typing indicator for next message
        }
        setTimeout(() => this.scrollToBottom(), 0);
      } else {
        clearInterval(intervalId);
        localStorage.setItem(this.tutorialName, "true");
        if (this.shownMessages[this.shownMessages.length - 1] === this.typingIndicator) {
          this.shownMessages.pop(); // Remove typing indicator if it is the last message
        }
      }
    }, 4000);
  }

  toggleChat(event: Event) {
    this.isChatVisible = !this.isChatVisible;
    event.stopPropagation();
  }

  scrollToBottom(): void {
    try {
      this.scrollableDiv.nativeElement.scrollTop = this.scrollableDiv.nativeElement.scrollHeight;
    } catch (err) { }
  }

  onDocumentClick(event: Event) {
    if (!this.isChatVisible) {
      return;
    }
    const chatContainer = document.querySelector('.chat-container');
    const target = event.target as HTMLElement;

    if (chatContainer && !chatContainer.contains(target)) {
      this.isChatVisible = false;
    }
  }
}
