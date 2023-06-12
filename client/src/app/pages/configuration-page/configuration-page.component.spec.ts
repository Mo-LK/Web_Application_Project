/* eslint-disable */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfigurationPageComponent } from './configuration-page.component';

describe('ConfigurationPageComponent', () => {
    let component: ConfigurationPageComponent;
    let fixture: ComponentFixture<ConfigurationPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConfigurationPageComponent],
            imports: [HttpClientTestingModule, RouterTestingModule, MatDialogModule],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(ConfigurationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        spyOn(component['cardChangeService'], 'fetchCards').and.resolveTo();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
