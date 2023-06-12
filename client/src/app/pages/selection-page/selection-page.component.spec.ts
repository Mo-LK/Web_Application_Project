import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';

import { SelectionPageComponent } from './selection-page.component';

describe('SelectionPageComponent', () => {
    let component: SelectionPageComponent;
    let fixture: ComponentFixture<SelectionPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SelectionPageComponent],
            imports: [HttpClientTestingModule, RouterTestingModule, MatDialogModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(SelectionPageComponent);

        component = fixture.componentInstance;
        fixture.detectChanges();
        spyOn(component['cardChangeService'], 'fetchCards').and.resolveTo();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit should call fetchCards and getPageData', async () => {
        spyOn(component['cardChangeService'], 'getPageData').and.returnValue([]);
        await component.ngOnInit();
        expect(component['cardChangeService'].fetchCards).toHaveBeenCalled();
    });
});
