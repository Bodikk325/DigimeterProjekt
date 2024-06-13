import { Component, ElementRef, HostListener, Input } from '@angular/core';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrl: './tooltip.component.css'
})
export class TooltipComponent {
  @Input() text: string = '';
  visible: boolean = false;
  position = { top: '0px', left: '0px' };

  constructor(private el: ElementRef) {}

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.visible) {
      this.position.top = `${event.clientY - 30}px`;
      this.position.left = `${event.clientX - 30}px`;
    }
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }
}
