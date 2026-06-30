import { Component, NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from 'src/app/services';

@Component({
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.scss'],
  providers: [DataService],
})
export class AnalyticsDashboardComponent {}

@NgModule({
  imports: [CommonModule],
  providers: [],
  exports: [],
  declarations: [AnalyticsDashboardComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AnalyticsDashboardModule {}
