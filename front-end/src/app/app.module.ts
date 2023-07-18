import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { AuthComponent } from './auth/auth.component';
import { ProfileComponent } from './profile/profile.component';
import { GameComponent } from './game/game.component';
import { MessageComponent } from './message/message.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DialogNotLoguedComponent } from './dialog-not-logued/dialog-not-logued.component';
import { UserPageComponent } from './user-page/user-page.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { CredentialsInterceptor } from './interceptors/credentials.interceptor';
import { AuthGuardService } from './auth/auth-guard.service';
import { AuthHandlerComponent } from './auth-handler/auth-handler.component';
import { DialogFirstLoginComponent } from './dialog-first-login/dialog-first-login.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NewUserFormComponent } from './new-user-form/new-user-form.component';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatDividerModule} from '@angular/material/divider';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    HeaderComponent,
    HomeComponent,
    AuthComponent,
    ProfileComponent,
    MessageComponent,
    ChatRoomComponent,
    DialogNotLoguedComponent,
    UserPageComponent,
    LeaderboardComponent,
    AuthHandlerComponent,
    DialogFirstLoginComponent,
    NewUserFormComponent,
  ],
  imports: [
    FormsModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    NoopAnimationsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    BrowserAnimationsModule,
    MatCheckboxModule,
    MatDividerModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CredentialsInterceptor,
      multi: true,
    },
    AuthGuardService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
