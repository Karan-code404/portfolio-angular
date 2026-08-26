import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contactme',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contactme.html',
  styleUrls: ['./contactme.scss'] 
})
export class ContactmeComponent {

  @Output() closePage = new EventEmitter<void>();

  // 1. VARIABLE DECLARATION (Error fix karne ke liye)
  isSubmitting: boolean = false; 

  closeForm() {
    this.closePage.emit();
    document.body.style.overflow = 'auto'; 
  }

  async onSubmit(event: Event) {
    event.preventDefault(); 
    
    // 2. LOADING START
    this.isSubmitting = true; 

    const formElement = event.target as HTMLFormElement;
    
    // Data extract karna
    const payload = {
      name: (formElement.querySelector('#name') as HTMLInputElement).value,
      email: (formElement.querySelector('#email') as HTMLInputElement).value,
      purpose: (formElement.querySelector('#purpose') as HTMLSelectElement).value,
      message: (formElement.querySelector('#message') as HTMLTextAreaElement).value
    };

    try {
      // Node.js Backend Call
      const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();

      if (result.success) {
        alert('Success! Your message has been delivered to Karan Shakya\'s inbox.');
        formElement.reset(); 
        this.closeForm(); 
      } else {
        alert('Oops! Backend received it, but failed to send email.');
      }
    } catch (error) {
      // Agar backend server chalu nahi hai toh ye alert aayega
      alert('Backend is not running! Please start your Node server (node server.js).');
    } finally {
      // 3. LOADING STOP (Chahe success ho ya error, button normal ho jayega)
      this.isSubmitting = false; 
    }
  }
}