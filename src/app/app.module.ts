import { DBConfig } from 'ngx-indexed-db';
import { getTnkStoresMeta, TnkStorage, TnkStorageModule } from 'projects/storage/src/public-api';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

const dbConfig: DBConfig  = {
  name: 'test',
  version: 3,
  objectStoresMeta: [
    getTnkStoresMeta("user"),
    getTnkStoresMeta("test"),
  ]
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    TnkStorageModule.forRoot(dbConfig),
  ],
  providers: [TnkStorage],
  bootstrap: [AppComponent]
})
export class AppModule { }
