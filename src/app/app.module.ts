import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import {MatTabsModule} from '@angular/material/tabs';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuizComponent } from './quiz/quiz.component';
import { ResultComponent } from './result/result.component';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './login/login.component';
import { StartComponent } from './start/start.component';
import { HeaderComponent } from './header/header.component';
import { RounderPipe } from './rounder.pipe';
import { NotificationComponent } from './notification/notification.component';
import { FooterComponent } from './footer/footer.component';
import { FloatingIconComponent } from './floating-icon/floating-icon.component';
import { LoaderComponent } from './loader/loader.component';
import { LoaderBlackComponent } from './loader-black/loader-black.component';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { HomePieChartComponent } from './home-pie-chart/home-pie-chart.component';
import { AiChatComponent } from './ai-chat/ai-chat.component';
import { TooltipComponent } from './tooltip/tooltip.component';
import { LoadingComponent } from './loading/loading.component';
import { ConfirmEmailComponent } from './confirm-email/confirm-email.component';
import { jwtErrorInterceptor } from './interceptors/jwt-error.interceptor';
import { NgxCaptchaModule } from 'ngx-captcha';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    QuizComponent,
    ResultComponent,
    LoginComponent,
    StartComponent,
    HeaderComponent,
    RounderPipe,
    NotificationComponent,
    FooterComponent,
    FloatingIconComponent,
    LoaderComponent,
    LoaderBlackComponent,
    BarChartComponent,
    PieChartComponent,
    HomePieChartComponent,
    AiChatComponent,
    TooltipComponent,
    LoadingComponent,
    ConfirmEmailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    BrowserAnimationsModule,
    NgxCaptchaModule
  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(withFetch(), withInterceptors([jwtErrorInterceptor])),
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
