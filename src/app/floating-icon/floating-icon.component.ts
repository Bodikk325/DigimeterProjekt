import { Component, ElementRef, Input, ViewChild, afterNextRender } from '@angular/core';
import { chownSync } from 'fs';

@Component({
  selector: 'app-floating-icon',
  templateUrl: './floating-icon.component.html',
  styleUrl: './floating-icon.component.css'
})
export class FloatingIconComponent {

  @ViewChild('scrollable') scrollableDiv!: ElementRef;
  scrollableElement: any;
  @Input() messages: string[] = [];
  shownMessages: string[] = [];
  @Input() tutorialName: string = ""

  /**
   *
   */
  constructor() {
    afterNextRender(() => {
      this.scrollableElement = this.scrollableDiv.nativeElement
    })

  }

  scrollToBottom() {
    setTimeout(() => {
      this.scrollableElement.scrollTo(0, this.scrollableElement.scrollHeight);
    }, 1000);
  }

  ngOnInit() {
    if (localStorage.getItem(this.tutorialName) != "yes") {
      this.isChatVisible = true;
      for (let index = 0; index < this.messages.length; index++) {
        setTimeout(() => {
          this.shownMessages = this.messages.slice(0, index + 1)
          this.scrollToBottom();
        }, 1000 * index);
        if (index == this.messages.length - 1) {
          localStorage.setItem(this.tutorialName, "yes");
        }
      }
    }
    else {
      this.shownMessages = this.messages
    }

  }

  isMessageLoading = false;
  isChatVisible = false;

  toggleChat(event: Event) {
    this.isChatVisible = !this.isChatVisible;
    event.stopPropagation();
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
