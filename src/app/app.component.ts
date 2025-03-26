import { Component } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Practice';


  subject(){

    const mySubject = new Subject<number>()
    mySubject.subscribe({
      next(value) {
          console.log("subbed 1 ",value);
          
      },
    })
    mySubject.subscribe({
      next(value) {
          console.log("subbed 2 ",value);
          
      },
    })

    mySubject.next(1)
    mySubject.next(12)
    mySubject.next(123)
    mySubject.complete()
  }
  


}
