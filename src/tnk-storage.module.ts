import { NgModule, ModuleWithProviders, InjectionToken } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TnkStorage } from './tnk-storage.service';

@NgModule({
  declarations: [],
  imports: [CommonModule]
})
export class TnkStorageModule {
  static forRoot(): ModuleWithProviders<TnkStorageModule> {
    return {
      ngModule: TnkStorageModule,
      providers: [TnkStorage]
    };
  }
}