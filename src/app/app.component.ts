import { Component } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private timelineCollection: AngularFirestoreCollection<any>;
  timeline: Observable<any[]>;

  constructor(private afs: AngularFirestore) {
    this.timelineCollection = afs.collection<any>('timeline');
    this.timeline = this.timelineCollection.valueChanges();
  }

  add(value: string) {
    this.timelineCollection.add({ message: value});
  }
}
