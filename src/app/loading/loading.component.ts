import { Component } from '@angular/core';
import { LoadingService } from '../services/loading.service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.css'
})
export class LoadingComponent {
  loading = this.loadingService.loading$;

  constructor(private loadingService: LoadingService) {}
}
