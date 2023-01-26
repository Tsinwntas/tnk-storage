import { ObjectStoreMeta } from 'ngx-indexed-db';
import { StorageEntity } from './data-factory';
export class DatabaseRecord {
	databasekey: string;
	entity: StorageEntity<any>;

	constructor(entity: StorageEntity<any>){
		this.databasekey = entity.databaseKey;
		this.entity = entity.saveEntity();
	}
}

export function toDB(entity : StorageEntity<any>) : DatabaseRecord {
	return new DatabaseRecord(entity);
}

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