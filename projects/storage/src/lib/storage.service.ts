import { User } from './user';
import { StorageEntity } from './data-factory';
import { toDB } from './database-record'
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { NgxIndexedDBService, ObjectStoreMeta, CONFIG_TOKEN, DBConfig } from 'ngx-indexed-db';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class TnkStorage extends NgxIndexedDBService {
  _user : User;

  constructor(@Inject(CONFIG_TOKEN) private dbConfigTnk: DBConfig, @Inject(PLATFORM_ID) private platformIdTnk: any) {
    super(dbConfigTnk, platformIdTnk)
    TnkStorage['DB'] = this;
  }

  async getUser(): Promise<User> {
    return new Promise<User>((resolve, reject)=>{
      if(!this.dbConfigTnk.objectStoresMeta.map(s=>s.store).includes('user'))
        reject("You need to add the 'user' table in the scema if you want to use the User entity.");
      this.getAllFromTable("user").then(data=>{
        if(!data || !data.length){
          let user = new User();
          this.updateUser(user);
          resolve(user);
        }
        else
          resolve(data[0]);
      },error=>reject(error));
    })
  }

  updateUser(user : User) {
    this.update("user",toDB(user)).subscribe
    ((data: any)=>console.log("update user:" + data));
  }

  async isOwner(owner? : string) : Promise<boolean>{
    if(!owner)
      return true;
    return (await this.getUser()).databaseKey == owner; 
  }

  create(entity : StorageEntity<any>){
    this.add(entity.getTableName(), toDB(entity)).subscribe((key: any)=>console.log("key:", key));
  }

  //Create Batch causes problems, avoid if possible, or use for small batches. Remember to subscribe to it or it will not do its job.
  createBatch(table : string, entities : StorageEntity<any>[]) : Observable<any> {
    return this.bulkAdd(table, entities.map((e : StorageEntity<any>)=>toDB(e)));
  }

  async getByEntity<T>(entity : StorageEntity<any>) : Promise<T>{
    return await this.get<T>(entity.getTableName(), entity.databaseKey);
  }

  async getFiltered(table : string, condition: any, returnKeys? : boolean): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      super.getAll(table).subscribe({
        next:(data: any) => {
          data.forEach((d : any)=>{
            if (condition(d.entity))
              results.push(returnKeys ? d.databasekey : d.entity) ;
          });
          resolve(results);
        }, 
        error:err=>reject(err)
      });
    });
  }

  async getAllFromTable(table : string, returnKeys? : boolean) : Promise<StorageEntity<any>[]> {
    return new Promise<StorageEntity<any>[]>((resolve, reject)=>{
      this.getFiltered(table, (data : StorageEntity<any>)=>true, returnKeys).then(
        data=>resolve(data),
        err=>reject(err)
      )
    });
  }

  get<T>(table: string, databaseKey: string): PromiseLike<T> {
    return new Promise<T>((resolve, reject) => {
      try{
        this.getByKey(table, databaseKey).subscribe({
          next:(data : any)=>{
            console.log("data:", data)
            if(!data)
              return resolve(data);
            return resolve(data.entity);
          }
        });
      }catch(e){
        console.log(e);
        reject()
      }
    })
  }

  async set(entity : StorageEntity<any>) : Promise<any>{
    return new Promise<any>((resolve, reject)=>{
      this.update(entity.getTableName(), toDB(entity)).subscribe((key: any)=>{
        return resolve(key)
      });
    })
  }

  deleteEntity(entity : StorageEntity<any>) {
    super.delete(entity.getTableName(), entity.databaseKey).subscribe((data : any)=>console.log("delete: "+data));
  }

  async deleteKeys(table : string, keys : string[]) : Promise<any>{
    return new Promise<any>((resolve, reject)=>{
        this.bulkDelete(table, keys).subscribe((result : any) => {
          console.log('result: ', result);
          return resolve(result);
        });
    }) 
  }

  deleteAll(tables : string[]){
    tables.forEach(table=>
    this.deleteObjectStore(table).subscribe((data: any)=>console.log("deleted:", data))
    );
  }

  

}

