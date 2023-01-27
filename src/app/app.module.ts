import { TnkDBConfig } from 'projects/storage/src/public-api';
import { DBConfig } from 'ngx-indexed-db';
import { TnkStorage, TnkStorageModule } from 'projects/storage/src/public-api';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';

const dbConfig: DBConfig  = new TnkDBConfig("test", 5).addObjectStoreSimple('test');

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    FormsModule, 
    BrowserModule,
    AppRoutingModule,
    TnkStorageModule.forRoot(dbConfig),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
