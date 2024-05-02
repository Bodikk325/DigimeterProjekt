import { Component, HostListener, afterNextRender } from '@angular/core';
import { ChatService } from './chat.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'DigimeterProjekt';
  isMessageLoading = false;

  isChatVisible = false;

  toggleChat(event: MouseEvent) {
    event.stopPropagation(); // Megállítjuk az esemény terjedését
    this.isChatVisible = !this.isChatVisible;
  }

  onDocumentClick(event: MouseEvent) {
    if (!this.isChatVisible) return;
    const container = document.querySelector('.chat-container');
    if (event.target instanceof Node && !container!.contains(event.target)) {
      this.isChatVisible = false;
    }
  }

  ngOnInit(): void {
    
  }

  isChatShown = false;
  messages: any[] = [];
  inputText: string = '';

  private checkIfRouteIsAllowed(url: string): boolean {
    // Egyedi logika az URL alapján
    return url.includes("quiz") || url.includes("result")
  }

  constructor(private chatService: ChatService, private activatedRoute: ActivatedRoute, private router : Router) {

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      
      if(event instanceof NavigationEnd)
        {
          this.isChatShown  = this.checkIfRouteIsAllowed(event.url)
        }

    });

    this.messages.push(
      {
        text : "Kérdésed van esetleg a válaszadással kapcsolatban? Ne habozz kérdezni, segítek ahol tudok!", user : false
      }
    )
    
  }

  sendMessage(): void {
    if (this.inputText.trim()) {
      this.messages.push({ text: this.inputText, user: true });
      this.isMessageLoading = true;
      this.chatService.sendMessage(this.inputText, this.messages).subscribe(response => {
        this.messages.push({ text: response.choices[0].message.content, user: false });
        this.isMessageLoading = false;
      });
      this.inputText = '';
    }
  }
}
