import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigurationPageComponent } from '@app/pages/configuration-page/configuration-page.component';
import { GameCreationComponent } from '@app/pages/game-creation/game-creation.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { LimitedModeComponent } from '@app/pages/limited-mode/limited-mode.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { SelectionPageComponent } from '@app/pages/selection-page/selection-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'config', component: ConfigurationPageComponent },
    { path: 'options/classic', component: SelectionPageComponent },
    { path: 'options/limited', component: LimitedModeComponent },
    { path: 'gameCreation', component: GameCreationComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
