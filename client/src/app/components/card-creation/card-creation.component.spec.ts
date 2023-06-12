/* eslint-disable @typescript-eslint/no-empty-function */
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BackgroundImage } from '@app/interfaces/background-image';
import { GameCreationComponent } from '@app/pages/game-creation/game-creation.component';
import { CardCreationComponent } from './card-creation.component';

describe('CardCreationComponent', () => {
    let component: CardCreationComponent;
    let fixture: ComponentFixture<CardCreationComponent>;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CardCreationComponent, GameCreationComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
        fixture = TestBed.createComponent(CardCreationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update canvas if there is a change', () => {
        const canvasUpdateSpy = spyOn(component, 'canvasUpdate' as never);
        component.image = new Image();
        component.ngOnChanges();

        expect(canvasUpdateSpy).toHaveBeenCalled();
    });

    it('clear canvas should call canvasUpdate', () => {
        // @ts-ignore
        spyOn(component, 'canvasUpdate' as never).and.callFake(() => {});
        component.clearCanvas();
        // @ts-ignore
        expect(component.canvasUpdate).toHaveBeenCalledWith(component['emptyImage']);
    });

    it('displayImage should call imageService.showPreview', () => {
        const backgroundImage: BackgroundImage = {
            message: 'error',
            image: new Image(),
        };
        spyOn(component.imageService, 'showPreview').and.returnValue(Promise.resolve(backgroundImage));
        const input = document.createElement('input');
        component.displayImage(input);
        expect(input.value).toEqual('');
    });

    it('displayImage should call imageService.showPreview and have no error message', () => {
        const backgroundImage: BackgroundImage = {
            message: '',
            image: new Image(),
        };
        spyOn(component.imageService, 'showPreview').and.returnValue(Promise.resolve(backgroundImage));
        const input = document.createElement('input');
        component.displayImage(input);
        expect(input.value).toEqual('');
    });
});
