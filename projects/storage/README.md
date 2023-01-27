# TnkStorage

This library is to provide a simple way of using indexed-db for typescript.
Perfect for simple object structure. Each table created has a schema of
`{databasekey : string, entity : StorageEntity}`
Each database key is created by its self and this library handles problems such as class functions lost due to JSON retrieval from the database.
It also creates by default a 'user' table, that holds the user for setting different kinds of user-preferences.

## Installation

`$ npm install ngx-indexed-db`
`$ npm install @tnk-modules/storage`

## Usage

Import the `TnkStorageModule` and initiate it:
```
import { TnkDBConfig } from '@tnk-modules/storage';
import { TnkStorageModule } from '@tnk-modules/storage';

const  dbConfig: DBConfig = new TnkDBConfig("test", 5)
	.addObjectStore('apples');
	.addObjectStoreSimple('picnics');
	.addObjectStoreWithoutInstance('forks');
	.addObjectStoreWithoutMock('spoons');

@NgModule({
  ...
  imports: [
    ...
    TnkStorageModule.forRoot(dbConfig),
  ],
  ...
})
```
*What each 'add' means, will be explained further down in the **TnkDBConfig** chapter.*
### Migrations
`new TnkDBConfig("test", 5, migrationFactory?)`
Please check the 'Migrations' chapter of [ngx-index-db](https://www.npmjs.com/package/ngx-indexed-db) documentation.

## TnkStorage service 
```
import { TnkStorage} from '@tnk-modules/storage';

...
  export class AppComponent {
    constructor(private tnk: TnkStorage){
    }
  }
```

### API

We cover several common methods used to work with the IndexedDB and NgxIndexedDB.
You will notice that we keep passing an instance of the item we want to handle, that is because even if we pass the type as a generic parameter (f.e. get\<T>) we cannot then instantiate it `new T()` to get the table name and to fix the item retrieved from the DB.
In cases that we don't care about instantiating or fixing an item (f.e. deleteKeys), we still pass the entity to get the table name to avoid magic strings.

**getUser(): Promise\<User>;**
Gets app user.
If the user does not exist, it will create a new one and return that one.
- @returns Promise of a user.
```
this.tnk.getUser().then(user=>this.user_ = user);
```
**updateUser(user: User): void;**
Update the user data.
- @param  user The new user data
```
this.tnk.setUser(this.user_);
```

**get<T  extends  StorageEntity\<T>>(instance : T, databaseKey: string) : Promise\<T>;**
Retrieves an entity from the table provided, that matches the key given.

* @param  instance Type of instance to get

* @param  databaseKey Key of entity

* @returns Promise of the retrieved entity

```
private apple = await this.tnk.get<Apple>(new Apple(), databasekey_);

// FOR THOSE THAT DON'T KNOW HOW PROMISES WORK, YOU CAN ALSO DO THIS

private apple;
this.tnk.get<Apple>(new Apple().getTableName(), databasekey_)
		.then(apple=>this.apple=apple);
```

**getByEntity<T  extends  StorageEntity\<T>>(entity : T)  :  Promise\<T>;**
Gets saved version of the entity provided from the DB.
Can be used for reloading entities.

* @param  entity Entity to reload

* @returns Promise of saved entity
```
private apple = await this.tnk.get<Apple>(new Apple(), databasekey_);
apple.takeABite();
//regret
apple = await this.tnk.getByEntity(apple);
```
*In this above example you could simply re-use tnk.get, but maybe in another more complicated example, you would have a better reason to use it. I personally don't have a proper usage example but the implementation is there if you want it.*

**getFiltered<T  extends  StorageEntity\<T>>(instance: T, condition: (value: StorageEntity\<any>) =>  boolean, returnKeys?: boolean): Promise<any[]>;**
Given a filter condition it will filter the table for entities.

* @param  instance Instance of type to be returned. Is necessary to fix the list retrieved from the DB

* @param  condition Function with storage entity as parameter and boolean return. Will be used for filtering

* @param  returnKeys Whether you are to return the keys of the entities returned instead of the entities themselves

* @returns Either array of filtered entities or their keys

```
private bittenApples = await this.tnk.getFiltered<Apple>(new Apple(), 
						(apple)=>apple.isBitten());
```
*If for some reason you only want the database keys  of those apples, just add in the parameters a `(.., ..., true)` and it will return an array of the keys only.*

**getAllFromTable<T  extends  StorageEntity\<T>>(instance: T, returnKeys?: boolean): Promise<any[]>;**
Gets all entities in the given entities table.

* @param  instance The type of entities to return
* @param  returnKeys Whether you to return the keys of the entities returned instead of the entities themselves
* @returns Either array of all entities of table or their keys
```
private apples = await this.tnk.getAllFromTable<Apple>(new Apple());
```

**set(entity: StorageEntity\<any>): Promise\<any>;**
Updates or inserts the given entity in the DB.

* @param  entity Entity to update or create
* @returns Promise if you want to handle the finish of updating, however the return is just the key
```
//works for creating
this.tnk.set(new Apple());

// and for updating
private apple = await this.tnk.get<Apple>(new Apple(), databasekey_);
apple.takeBite();
this.tnk.set(apple);
```

**deleteEntity(entity: StorageEntity\<any>): void;**
Deletes entity from DB.

* @param  entity Entity to delete.
```
onRemoveApple(apple : Apple){
	this.tnk.deteleEntity(apple);
}
```

**deleteKeys(instance : StorageEntity\<any>, keys: string[]): Promise<any>;**
Deletes all given keys from table.

* @param  instance The type of entities to delete
* @param  keys Keys to delete
* @returns Promise if you want to handle the finish of deletion.
```
this.tnk.getFiltered<Apple>(new Apple(), (apple)=>apple.isRotten(), true)
	.then(appleKeys=>{
		this.tnk.deleteKeys(new Apple(), appleKeys().then(()=>{
			console.log("Done deleting");
		})
	});
```



### Unnecessary - Please Avoid for now

**isOwner(owner?: string): Promise\<boolean>;**
No true implementation as of now, this is in design for syncing between devices. That will be in a future release.

- @param  owner Owner database key
- @returns Whether the user on this device is the owner of this object.



**create(entity: StorageEntity\<any>): void;**

Inserts the given entity in the database.
No need to call this one. Seems like 'set' works for inserting as well.

- @param  entity To create

**createBatch(table: string, entities: StorageEntity<any>[]): Observable\<any>;**

Supposedly inserts batch of records. Limit the number of data to under 100 if possible.
Create Batch causes problems, avoid if possible, or use for small batches. Remember to subscribe to it or it will not do its job.

In my own projects I had to stop using it and add each record individually. It was fast enough that I didn't mind.

- @param  table Name of the store

- @param  entities Entities to insert into DB.

- @returns Observalbe to subscribe to. If you do not subscribe it will not perfom the actions.