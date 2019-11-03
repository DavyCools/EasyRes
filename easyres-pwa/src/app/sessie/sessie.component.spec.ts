import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SessieComponent } from './sessie.component';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

describe('SessieComponent', () => {
  let component: SessieComponent;
  let fixture: ComponentFixture<SessieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), HttpClientModule],
      declarations: [ SessieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SessieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});