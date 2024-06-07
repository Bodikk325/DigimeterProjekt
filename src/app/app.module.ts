import { NgModule, importProvidersFrom } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import {MatTabsModule} from '@angular/material/tabs';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuizComponent } from './quiz/quiz.component';
import { ResultComponent } from './result/result.component';
import { HttpClientXsrfModule, provideHttpClient, withFetch } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './login/login.component';
import { StartComponent } from './start/start.component';
import { HeaderComponent } from './header/header.component';
import { RounderPipe } from './rounder.pipe';
import { NotificationComponent } from './notification/notification.component';
import { FooterComponent } from './footer/footer.component';
import { FirmSelectedValueToDisplayTextPipe } from './firm-selected-value-to-display-text.pipe';
import { FloatingIconComponent } from './floating-icon/floating-icon.component';
import { LoaderComponent } from './loader/loader.component';
import { LoaderBlackComponent } from './loader-black/loader-black.component';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { HomePieChartComponent } from './home-pie-chart/home-pie-chart.component';


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
    FirmSelectedValueToDisplayTextPipe,
    FloatingIconComponent,
    LoaderComponent,
    LoaderBlackComponent,
    BarChartComponent,
    PieChartComponent,
    HomePieChartComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    BrowserAnimationsModule
  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(withFetch()),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
