import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'
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
import { NewUserFormComponent } from './new-user-form/new-user-form.component';

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
    NewUserFormComponent,
  ],
  imports: [
    FormsModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    NoopAnimationsModule,
    MatDialogModule,
  ],
  providers: [ {
    provide: HTTP_INTERCEPTORS,
    useClass: CredentialsInterceptor,
    multi: true
    },
    AuthGuardService,
    ],
  bootstrap: [AppComponent]
})
export class AppModule{ }
