import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Ye zaroori hai *ngIf ke liye

@Component({
  selector: 'app-certifications',
  standalone: true, // Agar aap standalone components use kar rahe hain
  imports: [CommonModule], // Ye add karna zaroori hai
  templateUrl: './certifications.html',
  styleUrls: ['./certifications.scss']
})
export class Certifications {
  
  // Pop-up track karne ke liye variables
  isModalOpen = false;
  selectedImage = '';

  // Jab user card pe click karega toh ye function chalega
  openCertificate(imageUrl: string) {
    this.selectedImage = imageUrl;
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden'; // Peeche ka background scroll hona band kar dega
  }

  // Jab user pop-up band karega
  closeModal() {
    this.isModalOpen = false;
    this.selectedImage = '';
    document.body.style.overflow = 'auto'; // Wapas scrolling on kar dega
  }
}
