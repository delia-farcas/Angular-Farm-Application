import { Component, Output, EventEmitter} from '@angular/core';


@Component({
  selector: 'app-welcome-page',
  standalone: true,
  imports: [],
  templateUrl: './welcome-page.html',
  styleUrl: './welcome-page.css',
})
export class WelcomePage {
  @Output() goToAuthenticate = new EventEmitter<void>();


  onAuthenticateClick() {
    this.goToAuthenticate.emit();
  }
}
