import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePieChartComponent } from './home-pie-chart.component';

describe('HomePieChartComponent', () => {
  let component: HomePieChartComponent;
  let fixture: ComponentFixture<HomePieChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomePieChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HomePieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
