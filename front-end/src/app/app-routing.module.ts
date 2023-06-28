import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthComponent } from './auth/auth.component';
import { ProfileComponent } from './profile/profile.component';
import { GameComponent } from './game/game.component';
import { MessageComponent } from './message/message.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';
import { UserPageComponent } from './user-page/user-page.component';
import { AuthGuardService } from './auth/auth-guard.service';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'game', component: GameComponent, canActivate: [AuthGuardService] },
  { path: 'auth', component: AuthComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuardService] },
  { path: 'message', component: MessageComponent, canActivate: [AuthGuardService] },
  { path: 'chat-room', component: ChatRoomComponent, canActivate: [AuthGuardService] },
  { path: 'user-page/:pseudo', component: UserPageComponent, canActivate: [AuthGuardService] },
  { path: '**', component: HomeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
