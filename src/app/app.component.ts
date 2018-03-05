import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  timeline:string[] = ['Hello!'];

  add(value: string) {
    this.timeline.push(value);
  }
}
