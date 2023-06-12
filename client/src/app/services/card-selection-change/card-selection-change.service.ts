import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { POSITION_NOT_FOUND } from '@app/components/chat-box/chat-box.component.constants';
import { LoadingComponent } from '@app/components/loading/loading.component';
import { NameQueryComponent } from '@app/components/name-query/name-query.component';
import { Game } from '@app/interfaces/game';
import { CommunicationService } from '@app/services/communication/communication.service';
import { GameService } from '@app/services/game/game.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { Card } from '@common/card';
import { firstValueFrom } from 'rxjs';
import { FirstGameMode, GameParameters, NUMBER_CARD_PER_PAGE, SecondGameMode } from './card-selection-change.service.constants';

@Injectable({
    providedIn: 'root',
})
export class CardSelectionChangeService {
    previousPageButtonVisibility: boolean;
    nextPageButtonVisibility: boolean;
    isLimitedEnable: boolean;
    private cardsData: Card[];
    private currentPage: number;

    // We need all of these parameters, so we disable the max-params rule.
    // eslint-disable-next-line max-params
    constructor(
        public dialog: MatDialog,
        private comService: CommunicationService,
        private gameService: GameService,
        private clientService: SocketClientService,
    ) {
        this.cardsData = [];
        this.currentPage = 0;
        this.previousPageButtonVisibility = false;
        this.nextPageButtonVisibility = false;
        this.isLimitedEnable = true;
        this.handleSocket();
    }

    get areCardsToPlay() {
        return this.cardsData.length > 0;
    }

    async cardDeletion(id: string): Promise<void> {
        const loadingScreen = this.dialog.open(LoadingComponent);
        await firstValueFrom(this.comService.deleteRequest(`card/${id}`));
        this.handleCardDelete(id);
        loadingScreen.close();
    }

    async deleteAllCards(): Promise<void> {
        const loadingScreen = this.dialog.open(LoadingComponent);
        await firstValueFrom(this.comService.deleteRequest('card/'));
        this.cardsData.forEach((card) => {
            this.handleCardDelete(card.id);
        });
        loadingScreen.close();
    }

    async cardStatsReset(id: string = ''): Promise<void> {
        const loadingScreen = this.dialog.open(LoadingComponent);
        const route = id ? `card/stats/${id}` : 'card/stats';
        await firstValueFrom(this.comService.deleteRequest(route));
        loadingScreen.close();
    }

    getPageData(pageIndex: number = this.currentPage) {
        const startIndex = pageIndex * NUMBER_CARD_PER_PAGE;
        return this.cardsData.slice(startIndex, startIndex + NUMBER_CARD_PER_PAGE);
    }

    changePage(isNextPage: boolean) {
        this.currentPage = isNextPage ? this.currentPage + 1 : Math.max(this.currentPage - 1, 0);
        this.toggleButtons();
    }

    loadGame(parameters: GameParameters, index: number = 0) {
        let game: Game;
        const secondMode = parameters.isSolo ? SecondGameMode.SOLO : SecondGameMode.VERSUS;
        if (parameters.isClassic) {
            const data = this.cardsData[this.currentPage * NUMBER_CARD_PER_PAGE + index];
            game = {
                id: data.id,
                gameTitle: data.title,
                firstMode: FirstGameMode.CLASSIC,
                secondMode,
                difficulty: data.difficultyLevel,
                differences: [],
                differencesBackup: [],
            } as Game;
        } else {
            game = {
                id: FirstGameMode.LIMITED_TIME,
                gameTitle: FirstGameMode.LIMITED_TIME,
                firstMode: FirstGameMode.LIMITED_TIME,
                secondMode,
                differences: [],
            } as unknown as Game;
        }
        this.gameService.loadGame(game);
        this.dialog.open(NameQueryComponent, { data: { game } });
    }

    async fetchCards() {
        if (!this.cardsData.length) {
            const response = await firstValueFrom(this.comService.getRequest('card'));
            if (response) {
                this.cardsData = JSON.parse(response.body);
            }
            this.toggleButtons();
        }
        return this.cardsData;
    }

    private toggleButtons() {
        this.nextPageButtonVisibility = this.getPageData(this.currentPage + 1).length !== 0;
        this.previousPageButtonVisibility = this.currentPage !== 0;
    }

    private handleStatsChange(cardData: Card) {
        const index = this.cardsData.findIndex((card) => {
            return card.id === cardData.id;
        });
        this.cardsData[index].stats = cardData.stats;
    }

    private handleCardDelete(cardId: string) {
        const index = this.cardsData.findIndex((card) => {
            return cardId === card.id;
        });
        if (index !== POSITION_NOT_FOUND) this.cardsData.splice(index, 1);
        this.toggleButtons();
    }

    private handleSocket() {
        this.clientService.addCallbackToMessage('cardDeleted', (cardDelete) => this.handleCardDelete(cardDelete as string), false);
        this.clientService.addCallbackToMessage(
            'cardCreated',
            (cardCreatedInfo) => {
                this.cardsData.push(JSON.parse(cardCreatedInfo as string) as Card);
                this.toggleButtons();
            },
            false,
        );
        this.clientService.addCallbackToMessage('statsChanged', (cardInfo) => this.handleStatsChange(JSON.parse(cardInfo as string) as Card), false);
        this.clientService.addCallbackToMessage(
            'limitedModeEnable',
            (isEnable) => (this.isLimitedEnable = JSON.parse(isEnable as string) as boolean),
            false,
        );
    }
}
