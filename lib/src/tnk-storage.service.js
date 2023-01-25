var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TnkStorage_1;
import { toDB } from './database-record';
import { Injectable } from '@angular/core';
let TnkStorage = TnkStorage_1 = class TnkStorage {
    constructor(dbService) {
        this.dbService = dbService;
        TnkStorage_1.DB = this;
    }
    async getUser() {
        return this.get("user", "user");
    }
    updateUser(user) {
        this.dbService.update("user", toDB(user)).subscribe((data) => console.log("update user:" + data));
    }
    async isOwner(owner) {
        if (!owner)
            return true;
        return (await this.getUser()).databaseKey == owner;
    }
    create(entity) {
        this.dbService.add(entity.getTableName(), toDB(entity)).subscribe((key) => console.log("key:", key));
    }
    //Create Batch causes problems, avoid if possible, or use for small batches. Remember to subscribe to it or it will not do its job.
    createBatch(table, entities) {
        return this.dbService.bulkAdd(table, entities.map((e) => toDB(e)));
    }
    async getByEntity(entity) {
        return await this.get(entity.getTableName(), entity.databaseKey);
    }
    async getFiltered(table, condition, returnKeys) {
        return new Promise((resolve, reject) => {
            const results = [];
            this.dbService.getAll(table).subscribe((data) => {
                data.forEach((d) => {
                    if (condition(d.entity))
                        results.push(returnKeys ? d.databasekey : d.entity);
                });
                resolve(results);
            });
        });
    }
    async getAll(table, returnKeys) {
        return await this.getFiltered(table, (data) => true, returnKeys);
    }
    get(table, databaseKey) {
        return new Promise((resolve, reject) => {
            try {
                this.dbService.getByKey(table, databaseKey).subscribe((data) => {
                    console.log("data:", data);
                    if (!data)
                        return resolve(data);
                    return resolve(data.entity);
                });
            }
            catch (e) {
                console.log(e);
                reject();
            }
        });
    }
    async set(entity) {
        return new Promise((resolve, reject) => {
            this.dbService.update(entity.getTableName(), toDB(entity)).subscribe((key) => {
                return resolve(key);
            });
        });
    }
    delete(entity) {
        this.dbService.delete(entity.getTableName(), entity.databaseKey).subscribe((data) => console.log("delete: " + data));
    }
    async deleteKeys(table, keys) {
        return new Promise((resolve, reject) => {
            this.dbService.bulkDelete(table, keys).subscribe((result) => {
                console.log('result: ', result);
                return resolve(result);
            });
        });
    }
    deleteAll(tables) {
        tables.forEach(table => this.dbService.deleteObjectStore(table).subscribe((data) => console.log("deleted:", data)));
    }
};
TnkStorage = TnkStorage_1 = __decorate([
    Injectable({
        providedIn: 'root'
    })
], TnkStorage);
export { TnkStorage };
//# sourceMappingURL=tnk-storage.service.js.map