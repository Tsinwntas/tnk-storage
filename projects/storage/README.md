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

I cover several common methods used to work with the IndexedDB and NgxIndexedDB.
You will notice that I keep passing an instance of the item I  want to handle, that is because even if I pass the type as a generic parameter (f.e. get\<T>) I cannot then instantiate it `new T()` to get the table name and to fix the item retrieved from the DB.
In cases that I don't care about instantiating or fixing an item (f.e. deleteKeys), I still pass the entity to get the table name to avoid magic strings.

**getUser() : Promise\<User>;**
Gets app user.
If the user does not exist, it will create a new one and return that one.
- @returns Promise of a user.
```
this.tnk.getUser().then(user=>this.user_ = user);
```
**updateUser(user: User) : void;**
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

**getAllFromTable<T  extends  StorageEntity\<T>>(instance : T, returnKeys? : boolean) : Promise<any[]>;**
Gets all entities in the given entities table.

* @param  instance The type of entities to return
* @param  returnKeys Whether you to return the keys of the entities returned instead of the entities themselves
* @returns Either array of all entities of table or their keys
```
private apples = await this.tnk.getAllFromTable<Apple>(new Apple());
```

**set(entity : StorageEntity\<any>) : Promise\<any>;**
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

**deleteEntity(entity : StorageEntity\<any>) : void;**
Deletes entity from DB.

* @param  entity Entity to delete.
```
onRemoveApple(apple : Apple){
	this.tnk.deteleEntity(apple);
}
```

**deleteKeys(instance : StorageEntity\<any>, keys : string[]) : Promise<any>;**
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

**isOwner(owner? : string) : Promise\<boolean>;**
No true implementation as of now, this is in design for syncing between devices. That will be in a future release.

- @param  owner Owner database key
- @returns Whether the user on this device is the owner of this object.



**create(entity : StorageEntity\<any>) : void;**

Inserts the given entity in the database.
No need to call this one. Seems like 'set' works for inserting as well.

- @param  entity To create

**createBatch(table : string, entities : StorageEntity<any>[]) : Observable\<any>;**

Supposedly inserts batch of records. Limit the number of data to under 100 if possible.
Create Batch causes problems, avoid if possible, or use for small batches. Remember to subscribe to it or it will not do its job.

In my own projects I had to stop using it and add each record individually. It was fast enough that I didn't mind.

- @param  table Name of the store

- @param  entities Entities to insert into DB.

- @returns Observalbe to subscribe to. If you do not subscribe it will not perfom the actions.

## StorageEntity abstract class
Base abstract class that should be extended by anything that goes in the DB.

If you have children storage entity arrays in your class make sure to also have a childrenKeys array to save the keys, because I don't save the children to avoid duplication.

If you have objects that are of any other type as children then make sure to initialise them in the constructor, otherwise when retrieving them from the DB they will lose their functions. No this is not a problem with my implementation, but actually I provide a simple solution for this existing problem.

```
export  class  Apple extends StorageEntity<Apple> {

	constructor(toClone? : Apple);
}
```
When creating a new object of a type, you can pass an already existing object to be cloned. This is used in the storage.get function, so you shouldn't need to ever pass an entity when creating a new object.
*If you do use pass an entity to clone, bear in mind that it will not a generate a new databasekey for it.*

### API

**abstract  getCleanModel(entity? :  T) : T;**
Returns a clean model of the object for editing or other usages.
It's necessary because I cannot perform `new T()` so it has to be provided by the entity itself.

* @param  entity If provided will deep clone this entity
```
//as extended in the Apple object
getCleanModel(apple? : Apple){
	return new Apple(apple);
}
```
*Just like above, you shouldn't need to pass a parameter yourself.*

**abstract  getTableNameForClass() : string;**
Should return the base class name (or base table name if you don't plan to save items of type 'Apple' in a table named 'apples').

Needs to be implemented in every class with the appropriate return.
```
//as extended in the Apple object
getTableNameForClass() : string {
	return "apples";
}
```

**getTableName() : string;**
Returns the table name used for this entity.
Takes into consideration if the entity is an instance or mock, which means it would
be saved in a different table than the rest.

Should not be extended if you don't have an actual reason to extend.

**instantiate(toInstantiate? : T) : StorageEntity\<T>;**
Copies another entity if provided and marks this one as an instance. This means it will be saved in a table named "instance"+className. This table needs to be added in the schema in the `app.module`. If you added your table using `.addObjectStore('apples')` or `.addObjectStoreWithoutMock('apples')`, an instance table will be created automatically.

* @param  toInstantiate The entity that we want to clone before instantiating
```
addInstanceOfAppleToPicnic(apple : Apple){
	this.instance = apple.instantiate();
	this.picnic.appleKeys.push(this.instance.databaseKey);
	this.tnk.set(this.instance);
	this.tnk.set(this.picnic);
}
```
*I do this so that when we are looking for an instance of an object, then we don't look through the whole object DB. Also I instantiate so that we can clone and edit the instance without effecting the original.*

**mock(toMock? : T) : StorageEntity\<T>;**
Copies another entity if provided and marks this one as a mock object. This means it will be saved in a table named "mock"+className. This table needs to be added in the schema in the app.module. If you added your table using `.addObjectStore('apples')` or `.addObjectStoreWithoutInstance('apples')`, a mock table will be created automatically.

* @param  toMock The entity that we want to mock
```
sendMockOfApple(device : Device, apple : Apple){
	//no sync functionality yet.
	sync(device, apple.mock());
}
```
*This is to be used when I implement the sync functionality. For now, there is no real reason to mock an object.*

**saveEntity() : StorageEntity\<T>;**
Is called when the entity being set in the database.  Before saving, it will iterate over the properties and update their values accordingly.
* If a property is a storage entity array, it will remove it to save space. That is why you need to have a string array with the keys of children entities.
* Any children storage entities that are not an array, it will perform the saveEntity recursively to prepare them for storage.

You shouldn't have to ever call this, but you can extend it if you want something changed.

**deepClone(entity : T) : T;**
When loading from the database, the items lose their functions so we need to call this in order to set them up for usage.

You shouldn't have to ever call this, but you can extend it if you want something changed.

* @param  entity The entity to clone.

**getItems\<K>(dirty : StorageEntity\<K>, references : string[], items? : K[]) : Promise<K[]>;**
Loads the children storage entities of the given type. You call this only from the extended entities that you created that have children of type storage entity array.

* @param  dirty The instance that will be used to figure out what type of children we are loading.
* @param  references The array of database keys of the children.
* @param  items The array of children to be filled.

```
export class Picnic extends StorageEntity<Picnic>{
	appleKeys : string[];
	apples : Apple[];
	
	...
	
	async getApples() : Promise<Apple[]>{
		return await this.getItems(new Apple(), this.appleKeys, this.apples);
	}
}
```

**export  function  fixList\<T>(object : StorageEntity\<T>, list : T[]) : T[];**
Whenever you load a list from the database it needs to be passed here to be cleaned up and made ready for usage. This is handled in tnkStorage so you shouldn't need to use it. It is publicly exported, in case you extend the storage service and want to use it.

* @param  object The type of entities in this list. Necessary for clean up because we cannot perform `new T()`
* @param  keyRange The list that needs cleaning. The changes are not applied to this list but returned.

## Database Record

This whole module is built around a simple table structure of `{ databasekey : string, entity : StorageEntity }`. So before saving the service will handle this.

### API
**export   function  toDB(entity : StorageEntity\<any>) : DatabaseRecord;**
You should never have to call this yourself. It is called during storage to set the entities in the format the DB expects.

* @param  entity The entity that will be saved.



**export  function  getTnkStoresMeta(tableName : string) : ObjectStoreMeta;**
Since we only save one time of table in this database, I provide with an easy way to implement them in the schema.
If there is ever a functionality for dynamic creation of objectstores, then this will become deprecated. Until then it is unfortunatelly a necessity. If someone knows how to add stores after initialization without getting errors about database version, please contact me.

*You shouldn't have to call this, but it's provided anyway.*

* @param  tableName The name of the objectStore to create.

**TnkDBConfig.constructor(name : string, version : number, migrationFactory? : () => { [key : number]: (db : IDBDatabase, transaction : IDBTransaction) =>  void;});**
Simplified version of creating a DBConfig that works with this storage implementation. Adds by default a 'user' table to keep the user of the device and the preferences.

* @param  name Name of the object store
* @param  version Version number of the DB
* @param  migrationFactory (Optional) Ahead of time compiles requires an exported function for factories
*I am not sure on the proper use of the migrationFactory, I didn't have any need for it yet.*

**addObjectStore(tableName : string) : TnkDBConfig;**
Creates an object store for the name provided plus both the instance and mock table for this store.

* @param  tableName The name of the object store
* @returns Self

**addObjectStoreWithoutInstance(tableName : string) : TnkDBConfig;**
Creates an object store for the name provided plus mock tables for this store only.

* @param  tableName The name of the object store
* @returns Self

**addObjectStoreWithoutMock(tableName : string) : TnkDBConfig;**
Creates an object store for the name provided plus instance table for this store only.

* @param  tableName The name of the object store
* @returns Self

**addObjectStoreSimple(tableName : string) : TnkDBConfig;**
Creates an object store for the name provided without the instance and mock table.

* @param  tableName The name of the object store
* @returns Self

```
const  dbConfig : DBConfig = new TnkDBConfig("test", 5)
	.addObjectStore('apples');
	.addObjectStoreSimple('picnics');
	.addObjectStoreWithoutInstance('forks');
	.addObjectStoreWithoutMock('spoons');
```