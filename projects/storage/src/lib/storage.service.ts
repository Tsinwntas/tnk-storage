import { fixList } from 'projects/storage/src/public-api';
import { User } from './user';
import { StorageEntity } from './data-factory';
import { toDB } from './database-record'
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { NgxIndexedDBService, CONFIG_TOKEN, DBConfig } from 'ngx-indexed-db';
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

  /**
   * Gets app user.
   * If the user does not exist, it will create a new one and return that one.
   * @returns Promise of a user.
   */
  async getUser(): Promise<User> {
    return new Promise<User>((resolve, reject)=>{
      if(!this.dbConfigTnk.objectStoresMeta.map(s=>s.store).includes('user'))
        reject("You need to add the 'user' table in the scema if you want to use the User entity.");
      this.getAllFromTable(new User()).then(data=>{
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

  /**
   * Update the user data.
   * @param user The new user data.
   */
  updateUser(user : User) {
    this.update("user",toDB(user)).subscribe
    ((data: any)=>console.log("update user:" + data));
  }

  /**
   * No true implementation as of now, this is in design for syncing between devices. That will be in a future release.
   * @param owner Owner database key
   * @returns Whether the user on this device is the owner of this object.
   */
  async isOwner(owner? : string) : Promise<boolean>{
    if(!owner)
      return true;
    return (await this.getUser()).databaseKey == owner; 
  }

  /**
   * Inserts the given entity in the database.
   * No need to call this one. Seems like 'set' works for inserting as well.
   * @param entity To create
   */
  create(entity : StorageEntity<any>){
    this.add(entity.getTableName(), toDB(entity)).subscribe((key: any)=>console.log("key:", key));
  }

  /**
   * Supposedly inserts batch of records. Limit the number of data to under 100 if possible.
   * 
   * Create Batch causes problems, avoid if possible, or use for small batches. Remember to subscribe to it or it will not do its job.
   * In my own projects I had to stop using it and add each record individually. It was fast enough that I didn't mind.
   * @param table Name of the store
   * @param entities Entities to insert into DB.
   * @returns Observalbe to subscribe to. If you do not subscribe it will not perfom the actions.
   */
  createBatch(table : string, entities : StorageEntity<any>[]) : Observable<any> {
    return this.bulkAdd(table, entities.map((e : StorageEntity<any>)=>toDB(e)));
  }

  /**
   * Gets saved version of the entity provided from the DB.
   * Can be used for reloading entities.
   * @param entity Entity to reload
   * @returns Promise of saved entity.
   */
  async getByEntity<T extends StorageEntity<T>>(entity : T) : Promise<T>{
    return await this.get<T>(entity, entity.databaseKey);
  }

  /**
   * Given a filter condition it will filter the table for entities.
   * @param instance Instance of type to be returned. Is necessary to fix the list retrieved from the DB.
   * @param condition Function with storage entity as parameter and boolean return. Will be used for filtering
   * @param returnKeys Whether you are to return the keys of the entities returned instead of the entities themselves
   * @returns Either array of filtered entities or their keys.
   */
  async getFiltered<T extends StorageEntity<T>>(instance : T, condition: (value:StorageEntity<any>)=>boolean, returnKeys? : boolean): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: T[] = [];
      super.getAll(instance.getTableName()).subscribe({
        next:(data: any) => {
          data.forEach((d : any)=>{
            if (condition(d.entity))
              results.push(returnKeys ? d.databasekey : d.entity) ;
          });
          resolve(fixList(instance, results));
        }, 
        error:err=>reject(err)
      });
    });
  }

  /**
   * Gets all entities in the given entities table.
   * @param instance The type of entities to return
   * @param returnKeys Whether you to return the keys of the entities returned instead of the entities themselves
   * @returns Either array of all entities of table or their keys.
   */
  async getAllFromTable<T extends StorageEntity<T>>(instance: T, returnKeys? : boolean) : Promise<any[]> {
    return new Promise<StorageEntity<any>[]>((resolve, reject)=>{
      this.getFiltered(instance, (data : StorageEntity<any>)=>true, returnKeys).then(
        data=>resolve(data),
        err=>reject(err)
      )
    });
  }

  /**
   * Retrieves an entity from the table provided, that matches the key given.
   * @param instance Type of instance to get
   * @param databaseKey Key of entity
   * @returns Promise of the retrieved entity.
   */
  get<T extends StorageEntity<T>>(instance : T, databaseKey: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      try{
        this.getByKey(instance.getTableName(), databaseKey).subscribe({
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

  /**
   * Updates or inserts the given entity in the DB. 
   * @param entity Entity to update or create
   * @returns Promise if you want to handle the finish of updating, however the return is just the key.
   */
  async set(entity : StorageEntity<any>) : Promise<any>{
    return new Promise<any>((resolve, reject)=>{
      this.update(entity.getTableName(), toDB(entity)).subscribe((key: any)=>{
        return resolve(key)
      });
    })
  }

  /**
   * Deletes entity from DB.
   * @param entity Entity to delete.
   */
  deleteEntity(entity : StorageEntity<any>) {
    super.delete(entity.getTableName(), entity.databaseKey).subscribe((data : any)=>console.log("delete: "+data));
  }

  /**
   * Deletes all given keys from table.
   * @param instance The type of entities to delete
   * @param keys Keys to delete
   * @returns Promise if you want to handle the finish of deletion.
   */
  async deleteKeys(instance : StorageEntity<any>, keys : string[]) : Promise<any>{
    return new Promise<any>((resolve, reject)=>{
        this.bulkDelete(instance.getTableName(), keys).subscribe((result : any) => {
          console.log('result: ', result);
          return resolve(result);
        });
    }) 
  }

  

}

