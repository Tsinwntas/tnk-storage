import { User } from './user';
import { StorageEntity } from './data-factory';
import { DatabaseRecord, toDB } from './database-record'
import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class TnkStorage {
  _user : User;

  //bad practice to use
  public static DB : TnkStorage;

  constructor(private dbService: NgxIndexedDBService) {
    TnkStorage.DB = this;
  }

  async getUser(): Promise<User> {
    return this.get<User>("user", "user");
  }

  updateUser(user : User) {
    this.dbService.update("user",toDB(user)).subscribe
    ((data: any)=>console.log("update user:" + data));
  }

  async isOwner(owner? : string) : Promise<boolean>{
    if(!owner)
      return true;
    return (await this.getUser()).databaseKey == owner; 
  }

  create(entity : StorageEntity<any>){
    this.dbService.add(entity.getTableName(), toDB(entity)).subscribe((key: any)=>console.log("key:", key));
  }

  //Create Batch causes problems, avoid if possible, or use for small batches. Remember to subscribe to it or it will not do its job.
  createBatch(table : string, entities : StorageEntity<any>[]) : Observable<any> {
    return this.dbService.bulkAdd(table, entities.map((e : StorageEntity<any>)=>toDB(e)));
  }

  async getByEntity<T>(entity : StorageEntity<any>) : Promise<T>{
    return await this.get<T>(entity.getTableName(), entity.databaseKey);
  }

  async getFiltered(table : string, condition: any, returnKeys? : boolean): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      this.dbService.getAll(table).subscribe((data: any) => {
        data.forEach((d : any)=>{
          if (condition(d.entity))
            results.push(returnKeys ? d.databasekey : d.entity) ;
        });
        resolve(results);
      });
    });
  }

  async getAll(table : string, returnKeys? : boolean) : Promise<StorageEntity<any>[]> {
    return await this.getFiltered(table, (data : StorageEntity<any>)=>true, returnKeys);
  }

  get<T>(table: string, databaseKey: string): PromiseLike<T> {
    return new Promise<T>((resolve, reject) => {
      try{
        this.dbService.getByKey(table, databaseKey).subscribe(
          (data : any)=>{
            console.log("data:", data)
            if(!data)
              return resolve(data);
            return resolve(data.entity);
          });
      }catch(e){
        console.log(e);
        reject()
      }
    })
  }

  async set(entity : StorageEntity<any>) : Promise<any>{
    return new Promise<any>((resolve, reject)=>{
      this.dbService.update(entity.getTableName(), toDB(entity)).subscribe((key: any)=>{
        return resolve(key)
      });
    })
  }

  delete(entity : StorageEntity<any>) {
    this.dbService.delete(entity.getTableName(), entity.databaseKey).subscribe((data : any)=>console.log("delete: "+data));
  }

  async deleteKeys(table : string, keys : string[]) : Promise<any>{
    return new Promise<any>((resolve, reject)=>{
        this.dbService.bulkDelete(table, keys).subscribe((result : any) => {
          console.log('result: ', result);
          return resolve(result);
        });
    }) 
  }

  deleteAll(tables : string[]){
    tables.forEach(table=>
    this.dbService.deleteObjectStore(table).subscribe((data: any)=>console.log("deleted:", data))
    );
  }

}

