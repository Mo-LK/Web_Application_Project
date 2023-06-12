import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { CommunicationService } from '@app/services/communication/communication.service';
import SpyObj = jasmine.SpyObj;

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule, MatDialogModule],
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [MainPageComponent],
            providers: [{ provide: CommunicationService, useValue: communicationServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have 3 buttons (Classique, Temps limité, Configuration)', () => {
        expect(document.getElementsByTagName('button').length).toEqual(3);
        expect(document.getElementById('btn-classique')?.innerText).toEqual('CLASSIQUE');
        expect(document.getElementById('btn-temps-limite')?.innerText).toEqual('TEMPS LIMITÉ');
        expect(document.getElementById('btn-configuration')?.innerText).toEqual('CONFIGURATION');
    });
});
