import { CONFIG_TOKEN, DBConfig } from 'ngx-indexed-db';
import { TnkStorage } from 'projects/storage/src/public-api';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [],
  imports: [CommonModule]
})
export class TnkStorageModule {
  static forRoot(dbConfig: DBConfig): ModuleWithProviders<TnkStorageModule> {
    return {
      ngModule: TnkStorageModule,
      providers: [TnkStorage, { provide: CONFIG_TOKEN, useValue: dbConfig }]
  };
 }
}
