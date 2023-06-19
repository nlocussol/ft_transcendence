import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { GameComponent2 } from './game2/game.component';
import { AuthComponent } from './auth/auth.component';
import { ProfileComponent } from './profile/profile.component';
import { GameComponent } from './game/game.component';
import { MessageComponent } from './message/message.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'game2', component: GameComponent2 },
  { path: 'game', component: GameComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'message', component: MessageComponent },
  { path: 'chat-room', component: ChatRoomComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
