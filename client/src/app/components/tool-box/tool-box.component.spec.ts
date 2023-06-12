/*eslint-disable*/
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolBoxComponent } from './tool-box.component';

describe('ToolBoxComponent', () => {
    let component: ToolBoxComponent;
    let fixture: ComponentFixture<ToolBoxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ToolBoxComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(ToolBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onColorChanged should assign the color to the drawing service', () => {
        component['selectedColor'] = '#012345';
        component.onColorChanged();
        expect(component.drawingService.color).toEqual('#012345');
    });

    it('onToolChanged should assign the tool to the drawing service', () => {
        component.onToolChanged('pencil');
        expect(component.drawingService.tool).toEqual('pencil');
    });

    it('onPencilSizeChanged should assign the pencil size to the drawing service', () => {
        component['pencilSize'] = 5;
        component.onPencilSizeChanged();
        expect(component.drawingService.pencilSize).toEqual(5);
    });

    it('onEraserSizeChanged shoudl assign the eraser size to the drawing service', () => {
        component['eraserSize'] = 15;
        component.onEraserSizeChanged();
        expect(component.drawingService.eraserSize).toEqual(15);
    });

    it('handleKeyBoardEvent should call undo', () => {
        component.drawingService.tool = 'drawRectangle';
        const event = { key: 'z', ctrlKey: true } as KeyboardEvent;
        const spy = spyOn(component.drawingService, 'undoVerification').and.callFake(() => {});
        component.handleKeyBoardEvent(event);
        expect(spy).toHaveBeenCalled();

        const eventZ = { key: 'Z', ctrlKey: true } as KeyboardEvent;

        component.handleKeyBoardEvent(eventZ);
        expect(spy).toHaveBeenCalled();
    });

    it('handleKeyBoardEvent should call redo', () => {
        const event = { key: 'z', ctrlKey: true, shiftKey: true } as KeyboardEvent;
        const spy = spyOn(component.drawingService, 'redoVerification' as never).and.callThrough();
        component.handleKeyBoardEvent(event);
        expect(spy).toHaveBeenCalled();

        const eventZ = { key: 'Z', ctrlKey: true, shiftKey: true } as KeyboardEvent;
        component.handleKeyBoardEvent(eventZ);
        expect(spy).toHaveBeenCalled();
    });
});
