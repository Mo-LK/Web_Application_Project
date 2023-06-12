import { Component } from '@angular/core';
import { LOSE_MESSAGE, WIN_MESSAGE } from '@app/pages/game-page/game-page.component.constants';
import { GameService } from '@app/services/game/game.service';
import { DEFAULT_LEADERBOARD_POSITION } from '@app/services/game/game.service.constants';

@Component({
    selector: 'app-end-game',
    templateUrl: './end-game.component.html',
    styleUrls: ['./end-game.component.scss'],
})
export class EndGameComponent {
    protected winMessage: string;
    protected loseMessage: string;

    constructor(protected gameService: GameService) {
        this.winMessage = WIN_MESSAGE;
        this.loseMessage = LOSE_MESSAGE;
    }

    protected replay(): void {
        this.gameService.videoGameControlsAreVisible = true;
        this.gameService.deleteMessage++;
        this.gameService.replay();
    }

    protected isLeaderboardPosition() {
        return (
            this.gameService.gameIsWon &&
            this.gameService.leaderboardPosition &&
            this.gameService.leaderboardPosition !== DEFAULT_LEADERBOARD_POSITION
        );
    }
}
