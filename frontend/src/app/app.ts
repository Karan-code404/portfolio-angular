import { Component, signal } from '@angular/core'; // signal imported hai
import { NavbarComponent } from './navbar/navbar';
import { About } from './about/about';
import { Skills } from './skills/skills';
import { Projects } from './projects/projects';
import { Certifications } from './certifications/certifications';
import { CommonModule } from '@angular/common';
import { Contact } from './contact/contact';
import { ContactmeComponent } from './contactme/contactme'; 

@Component({
  selector: 'app-root',
  imports: [NavbarComponent, About, Skills, Projects, Certifications, Contact, ContactmeComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');
  
  // YAHAN CHANGE KIYA HAI: Normal variable ko Signal bana diya
  isContactFormVisible = signal(false);
}