import { CONFIG_TOKEN } from 'ngx-indexed-db';
import { TnkStorage } from './storage.service';
import { TnkDBConfig } from './database-record';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [],
  imports: [CommonModule]
})
export class TnkStorageModule {
  static forRoot(dbConfig: TnkDBConfig): ModuleWithProviders<TnkStorageModule> {
    return {
      ngModule: TnkStorageModule,
      providers: [TnkStorage, { provide: CONFIG_TOKEN, useValue: dbConfig }]
  };
 }
}
