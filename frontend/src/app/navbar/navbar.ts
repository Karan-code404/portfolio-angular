import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent {
  // Signal bahar bhejney ke liye Output
  @Output() openContact = new EventEmitter<void>();

  triggerContact() {
    this.openContact.emit();
    // Background scroll band karne ke liye
    document.body.style.overflow = 'hidden';
  }
}