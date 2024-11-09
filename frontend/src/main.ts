import {bootstrapApplication} from '@angular/platform-browser';
import {appConfig} from './app/app.config';
import {AppComponent} from './app/app.component';

// Active le mode production TODO: decommenter avant rendu
// enableProdMode();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
