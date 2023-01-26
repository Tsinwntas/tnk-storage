import { TnkStorage } from 'projects/storage/src/public-api';
import { Component, inject, OnInit } from '@angular/core';
import { StorageEntity } from 'projects/storage/src/public-api';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'tnk-storage';

  constructor(private tnk : TnkStorage){}
  
  ngOnInit(): void {
    debugger;
    this.tnk.set(new Test());
    this.tnk.getUser().then(u=>console.log(u));
  }

}

export class Test extends StorageEntity<Test>{
  getCleanModel(entity?: Test): StorageEntity<Test> {
    return new Test(entity);
  }
  getTableNameForClass(): string {
    return "test";
  }

}
