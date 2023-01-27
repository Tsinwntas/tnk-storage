import { ObjectStoreMeta, DBConfig } from 'ngx-indexed-db';
import { StorageEntity } from './data-factory';
export class DatabaseRecord {
	databasekey: string;
	entity: StorageEntity<any>;

	constructor(entity: StorageEntity<any>){
		this.databasekey = entity.databaseKey;
		this.entity = entity.saveEntity();
	}
}

/**
* You should never have to call this yourself. It is called during storage to set the entities in the format the DB expects.
* @param entity The entity that will be saved.
*/
export function toDB(entity : StorageEntity<any>) : DatabaseRecord {
	return new DatabaseRecord(entity);
}


/**
* Since we only save one time of table in this database, I provide with an easy way to implement them in the schema.
* If there is ever a functionality for dynamic creation of objectstores, then this will become deprecated. Until then 
* it is unfortunatelly a necessity. 
* @param tableName The name of the objectStore to create.
*/
export function getTnkStoresMeta(tableName: string) : ObjectStoreMeta {
	return {
		store: tableName,
		storeConfig: { keyPath: 'databasekey', autoIncrement: false },
		storeSchema: [
		  { name: 'databasekey', keypath: 'databasekey', options: { unique: true } },
		  { name: 'entity', keypath: 'entity', options: { unique: false } }
		]
	};
}


export class TnkDBConfig implements DBConfig {
	name: string;
	version: number;
	objectStoresMeta: ObjectStoreMeta[];
	migrationFactory?: () => { [key: number]: (db: IDBDatabase, transaction: IDBTransaction) => void; };
	
	/**
	 * Simplified version of creating a DBConfig that works with this storage implementation.
	 * Adds by default a 'user' table to keep the user of the device and the preferences.
	 * @param name Name of the object store
	 * @param version Version number of the DB
	 * @param migrationFactory (Optional) Ahead of time compiles requires an exported function for factories
	 */
	constructor(name: string, version: number, migrationFactory? : () => { [key: number]: (db: IDBDatabase, transaction: IDBTransaction) => void; }){
		this.name = name;
		this.version = version;
		this.migrationFactory = migrationFactory;
		this.objectStoresMeta = [];
		this.addUserStore();
	}

	private addUserStore() : TnkDBConfig {
		return this.addObjectStoreSimple('user');
	}

	private addObjectStores(tableName : string, addInstance : boolean, addMock : boolean) : TnkDBConfig {
		this.objectStoresMeta = this.objectStoresMeta.concat(getTnkStoresMeta(tableName));
		if(addInstance)
			this.objectStoresMeta = this.objectStoresMeta.concat(getTnkStoresMeta("instance"+tableName));
		if(addMock)
			this.objectStoresMeta = this.objectStoresMeta.concat(getTnkStoresMeta("mock"+tableName));
		return this;
	}

	/**
	 * Creates an object store for the name provided plus both the instance and mock table for this store.
	 * @param tableName The name of the object store
	 * @returns Self
	 */
	public addObjectStore(tableName : string) : TnkDBConfig {
		return this.addObjectStores(tableName, true, true);
	}


	/**
	 * Creates an object store for the name provided plus mock table for this store only.
	 * @param tableName The name of the object store
	 * @returns Self
	 */
	public addObjectStoreWithoutInstance(tableName : string) : TnkDBConfig {
		return this.addObjectStores(tableName, false, true);
	}


	/**
	 * Creates an object store for the name provided plus instance table for this store only.
	 * @param tableName The name of the object store
	 * @returns Self
	 */
	public addObjectStoreWithoutMock(tableName : string) : TnkDBConfig {
		return this.addObjectStores(tableName, true, false);
	}


	/**
	 * Creates an object store for the name provided without the instance and mock table.
	 * @param tableName The name of the object store
	 * @returns Self
	 */
	public addObjectStoreSimple(tableName : string) : TnkDBConfig {
		return this.addObjectStores(tableName, false, false);
	}





}