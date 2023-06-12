import { AfterViewInit, Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SubmissionService } from '@app/services/submission/submission.service';
import { MAX_LENGTH_NAME, MAX_LIMIT_DIFFERENCES, MIN_LENGTH_NAME, MIN_LIMIT_DIFFERENCES } from './cards-validation.component.constants';

@Component({
    selector: 'app-cards-validation',
    templateUrl: './cards-validation.component.html',
    styleUrls: ['./cards-validation.component.scss'],
})
export class CardsValidationComponent implements AfterViewInit {
    gameName: string;
    difficulty: string;
    numberOfDifferences: number;
    differencesImageBase64: SafeResourceUrl;
    protected readonly minLengthName: number;
    protected readonly maxLengthName: number;

    // Justification :  We need all of these parameters, so we disable the max-params rule.
    // eslint-disable-next-line max-params
    constructor(
        private dialogRef: MatDialogRef<CardsValidationComponent>,
        private submissionService: SubmissionService,
        private sanitizer: DomSanitizer,
        private router: Router,
    ) {
        this.gameName = '';
        this.minLengthName = MIN_LENGTH_NAME;
        this.maxLengthName = MAX_LENGTH_NAME;
        this.linkImage();
        this.linkNumberDifferences();
        this.linkDifficulty();
    }

    ngAfterViewInit(): void {
        this.submissionService.finishedLoadingSubject.next(true);
        // this.finishedLoadingSubject.complete();
    }

    save(): void {
        if (this.isEnoughDifferences() && this.isTitleValid()) {
            this.submissionService.saveCard(this.gameName);
            this.dialogRef.close();
            this.router.navigate(['/config']);
        }
    }

    isEnoughDifferences(): boolean {
        return !(this.numberOfDifferences < MIN_LIMIT_DIFFERENCES || this.numberOfDifferences > MAX_LIMIT_DIFFERENCES);
    }

    isTitleValid(): boolean {
        return this.gameName.trim().length <= this.maxLengthName && this.gameName.trim().length >= this.minLengthName;
    }

    private linkImage(): void {
        this.differencesImageBase64 = this.sanitizer.bypassSecurityTrustResourceUrl(
            'data:image/png;base64,' + this.submissionService.cardIO.firstImage,
        );
    }

    private linkNumberDifferences(): void {
        this.numberOfDifferences = this.submissionService.cardIO.metadata.differences.length;
    }

    private linkDifficulty(): void {
        this.difficulty = this.submissionService.cardIO.metadata.difficultyLevel;
    }
}
