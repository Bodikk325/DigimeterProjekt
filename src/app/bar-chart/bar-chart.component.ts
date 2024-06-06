
import { Component, OnInit, Input, ElementRef, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';

declare var d3: any;

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.css'
})
export class BarChartComponent {
  @Input() data: any;
 
  private svg: any;
  private margin = { top: 20, right: 30, bottom: 40, left: 40 };
  private width!: number;
  private height!: number;

  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    this.createChart();
  }

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.createChart();
    }
  }

  private createChart(): void {
    const element = this.el.nativeElement.querySelector('.chart-container');
    element.innerHTML = ''; // Clear previous chart

    this.width = element.offsetWidth - this.margin.left - this.margin.right;
    this.height = element.offsetHeight - this.margin.top - this.margin.bottom;

    this.svg = d3.select(element)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    const x = d3.scaleBand()
      .domain(this.data.map((d:any) => d.category))
      .range([0, this.width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, 100])
      .nice()
      .range([this.height, 0]);

    this.svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(x));

    this.svg.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y));

    this.svg.selectAll('.bar')
      .data(this.data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', (d:any) => x(d.category))
      .attr('y', (d:any) => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', (d:any) => this.height - y(d.value))
      .attr('fill', 'steelblue');
  }
  
}
