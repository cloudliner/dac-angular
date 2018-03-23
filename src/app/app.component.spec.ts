import { TestBed, async } from '@angular/core/testing';
import { AngularFirestore } from 'angularfire2/firestore';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';

const timeline = [[
  { message: 'Hello, Test!' }
]];
const data = Observable.from(timeline);
const collectionStub = {
  valueChanges: jasmine.createSpy('valueChanges').and.returnValue(data)
};
const angularFiresotreStub = {
  collection: jasmine.createSpy('collection').and.returnValue(collectionStub)
};

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      providers: [
        { provide: AngularFirestore, useValue: angularFiresotreStub }
      ]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
  it('should have timeline', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.timeline).toBeDefined();
  }));
  it('should render message in a li tag', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('ul>li').textContent).toContain('Hello, Test!');
  }));
});
