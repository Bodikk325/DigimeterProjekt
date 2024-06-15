import { Injectable, Injector } from '@angular/core';
import { ApplicationRef, ComponentFactoryResolver, EmbeddedViewRef } from '@angular/core';
import { NotificationComponent, NotificationType } from '../notification/notification.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private notiRef!: NotificationComponent;
  private newNotiComp! : NotificationComponent;

  constructor(private injector: Injector, private appRef: ApplicationRef, private componentFactoryResolver: ComponentFactoryResolver) { }

  show(message: string, type : NotificationType) {
    if (!this.notiRef) {
      this.appendToastComponentToBody(message, type);
    } else {
      this.notiRef.display(message, type);
    }
  }

  private appendToastComponentToBody(message: string,type : NotificationType) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(NotificationComponent);
    const componentRef = componentFactory.create(this.injector);
    this.appRef.attachView(componentRef.hostView);

    const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;

    document.body.appendChild(domElem);

    this.notiRef = componentRef.instance;
    this.notiRef.display(message, type);

    this.notiRef.onDestroy = () => {
      this.appRef.detachView(componentRef.hostView);
      componentRef.destroy();
      this.notiRef = this.newNotiComp;
    };
  }
}
