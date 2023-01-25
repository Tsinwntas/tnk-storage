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