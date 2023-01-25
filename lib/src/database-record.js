export class DatabaseRecord {
    constructor(entity) {
        this.databasekey = entity.databaseKey;
        this.entity = entity.saveEntity();
    }
}
export function toDB(entity) {
    return new DatabaseRecord(entity);
}
//# sourceMappingURL=database-record.js.map