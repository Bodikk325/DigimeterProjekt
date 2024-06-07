import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { QuizComponent } from './quiz/quiz.component';
import { ResultComponent } from './result/result.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';
import { StartComponent } from './start/start.component';

const routes: Routes = [
  { path: 'home', 
  component : HomeComponent,
  canActivate: [AuthGuard]
  },
  { path: '', component : LoginComponent, canActivate: [AuthGuard]},
  {path : 'quiz/:topic', component : QuizComponent, canActivate: [AuthGuard]},
  {path : 'start', component : StartComponent},
  {path : 'result/:id', component : ResultComponent, canActivate: [AuthGuard]},
  { path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
