import { Component, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SubmissionService } from '@app/services/submission/submission.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-loading',
    templateUrl: './loading.component.html',
    styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent implements OnDestroy {
    private subscriber: Subscription;
    constructor(private submissionService: SubmissionService, private dialogRef: MatDialogRef<LoadingComponent>) {
        this.dialogRef.disableClose = true;
        this.subscriber = this.submissionService.finishedLoadingSubject.subscribe((finishedLoading: boolean) => {
            if (finishedLoading) {
                this.dialogRef.close();
            }
        });
    }

    ngOnDestroy(): void {
        this.subscriber.unsubscribe();
    }
}
