import { StorageEntity } from "./data-factory";
export class User extends StorageEntity {
    constructor(user) {
        super(user);
        if (!user || !user.name)
            this.name = "USER_" + this.databaseKey;
    }
    getCleanModel(user) {
        return new User(user);
    }
    getTableNameForClass() {
        return "user";
    }
}
//# sourceMappingURL=user.js.map