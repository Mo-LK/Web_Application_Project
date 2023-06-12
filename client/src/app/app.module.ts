import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CardComponent } from '@app/components/card/card.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GameCreationComponent } from '@app/pages/game-creation/game-creation.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { SelectionPageComponent } from '@app/pages/selection-page/selection-page.component';
import { CardCreationComponent } from './components/card-creation/card-creation.component';
import { CardDrawingComponent } from './components/card-drawing/card-drawing.component';
import { CardsValidationComponent } from './components/cards-validation/cards-validation.component';
import { ChatBoxComponent } from './components/chat-box/chat-box.component';
import { DifferenceCountComponent } from './components/difference-count/difference-count.component';
import { GameInformationComponent } from './components/game-information/game-information.component';
import { HistoryComponent } from './components/history/history.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { LobbyComponent } from './components/lobby/lobby.component';
import { NameQueryComponent } from './components/name-query/name-query.component';
import { PlayerJoinComponent } from './components/player-join/player-join.component';
import { PopupMessageComponent } from './components/popup-message/popup-message.component';
import { SelectionAreaComponent } from './components/selection-area/selection-area.component';
import { ToolBoxComponent } from './components/tool-box/tool-box.component';
import { ConfigurationPageComponent } from './pages/configuration-page/configuration-page.component';
import { LimitedModeComponent } from './pages/limited-mode/limited-mode.component';
import { VideoReplayControlComponent } from './components/video-replay-control/video-replay-control.component';
import { ClueIndicatorComponent } from './components/clue-indicator/clue-indicator.component';
import { MatIconModule } from '@angular/material/icon';
import { GameConstantsComponent } from './components/game-constants/game-constants.component';
import { EndGameComponent } from './components/end-game/end-game.component';
import { DeleteAllCardsConfirmationComponent } from './components/delete-all-cards-confirmation/delete-all-cards-confirmation.component';
import { ResetAllStatsConfirmationComponent } from './components/reset-all-stats-confirmation/reset-all-stats-confirmation.component';
import { AbandonConfirmationComponent } from './components/abandon-confirmation/abandon-confirmation.component';
import { LoadingComponent } from './components/loading/loading.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        GamePageComponent,
        MainPageComponent,
        MaterialPageComponent,
        PlayAreaComponent,
        SelectionPageComponent,
        LeaderboardComponent,
        CardComponent,
        TimerComponent,
        GameInformationComponent,
        DifferenceCountComponent,
        SelectionAreaComponent,
        ConfigurationPageComponent,
        CardsValidationComponent,
        GameCreationComponent,
        CardCreationComponent,
        ToolBoxComponent,
        CardDrawingComponent,
        ChatBoxComponent,
        LobbyComponent,
        PlayerJoinComponent,
        NameQueryComponent,
        LimitedModeComponent,
        HistoryComponent,
        PopupMessageComponent,
        VideoReplayControlComponent,
        ClueIndicatorComponent,
        GameConstantsComponent,
        EndGameComponent,
        DeleteAllCardsConfirmationComponent,
        ResetAllStatsConfirmationComponent,
        AbandonConfirmationComponent,
        LoadingComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        MatGridListModule,
        ReactiveFormsModule,
        MatInputModule,
        MatDialogModule,
        MatIconModule,
    ],
    providers: [DatePipe],
    bootstrap: [AppComponent],
})
export class AppModule {}
