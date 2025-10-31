import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextPanelMenuComponent } from './context-panel-menu.component';

describe('ContextPanelMenuComponent', () => {
  let component: ContextPanelMenuComponent;
  let fixture: ComponentFixture<ContextPanelMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContextPanelMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContextPanelMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
