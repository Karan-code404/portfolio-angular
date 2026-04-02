import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactmeComponent } from './contactme';

describe('Contactme', () => {
  let component: ContactmeComponent;
  let fixture: ComponentFixture<ContactmeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactmeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactmeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
