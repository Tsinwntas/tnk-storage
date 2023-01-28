import { TnkStorage } from 'projects/storage/src/public-api';
import { Component, OnInit } from '@angular/core';
import { StorageEntity } from 'projects/storage/src/public-api';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'tnk-storage';
  typeAItems : Test[] = [];
  typeBItems : Test[] = [];

  itemName : string;
  itemType : string;


  constructor(private tnk : TnkStorage){}
  
  ngOnInit(): void {
    debugger;
    this.getItems();
  }

  getItems() {
    debugger;
    this.tnk.getFiltered(new Test(), (entity : Test)=>entity.type == 'A').then((entities : Test[])=>this.typeAItems = entities);
    this.tnk.getFiltered(new Test(), (entity : Test)=>entity.type == 'B').then((entities : Test[])=>this.typeBItems = entities);
  }

  addItem(){
    console.log(this.typeAItems)
    let item = new Test();
    item.name = this.itemName;
    item.type = this.itemType;

    this.tnk.set(item);
    this.getItems();
  }

}

export class Test extends StorageEntity<Test>{

  name: string;
  type: string;

  constructor(test? : Test){
    super(test);
  }

  getCleanModel(entity?: Test): Test {
    return new Test(entity);
  }
  getTableNameForClass(): string {
    return "test";
  }

}
