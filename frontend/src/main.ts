import {bootstrapApplication} from '@angular/platform-browser';
import {appConfig} from './app/app.config';
import {AppComponent} from './app/app.component';

// Enable production mode TODO: uncomment before release
// enableProdMode();

bootstrapApplication(AppComponent, appConfig)
  .catch((error) => console.error(error));
