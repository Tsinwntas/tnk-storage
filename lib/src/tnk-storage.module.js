var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TnkStorageModule_1;
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TnkStorage } from './tnk-storage.service';
let TnkStorageModule = TnkStorageModule_1 = class TnkStorageModule {
    static forRoot() {
        return {
            ngModule: TnkStorageModule_1,
            providers: [TnkStorage]
        };
    }
};
TnkStorageModule = TnkStorageModule_1 = __decorate([
    NgModule({
        declarations: [],
        imports: [CommonModule]
    })
], TnkStorageModule);
export { TnkStorageModule };
//# sourceMappingURL=tnk-storage.module.js.map