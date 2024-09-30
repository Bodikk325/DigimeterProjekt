import { Component, OnInit, Input, ElementRef, OnChanges, SimpleChanges, AfterViewInit, HostListener } from '@angular/core';

declare var d3: any;

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() data: any;

  private svg: any;
  private margin;
  private width!: number;
  private height!: number;
  private colors;

  constructor(private el: ElementRef) {
    this.margin = { top: 20, right: 30, bottom: 40, left: 40 }

    
    const customColors = ['#0072b5', '#B54300'];

    this.colors = d3.scaleOrdinal(customColors)
   }

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

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.createChart();
  }

  private createChart(): void {
    const element = this.el.nativeElement.querySelector('.chart-container');
    element.innerHTML = ''; // Clear previous chart

    this.width = element.offsetWidth - this.margin.left - this.margin.right;
    this.height = element.offsetHeight - this.margin.top - this.margin.bottom;

    this.svg = d3.select(element)
      .append('svg')
      .attr('viewBox', `0 0 ${this.width + this.margin.left + this.margin.right} ${this.height + this.margin.top + this.margin.bottom}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    const x = d3.scaleBand()
      .domain(this.data.map((d: any) => d.category))
      .range([0, this.width])
      .padding(0.2); // Add padding between bars

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
      .attr('x', (d: any) => x(d.category))
      .attr('y', this.height)  // Start position for animation
      .attr('width', x.bandwidth())
      .attr('height', 0)  // Start height for animation
      .attr('fill', (d: any, i: number) => this.colors(i))
      .transition()  // Start transition
      .duration(800)  // Duration of the animation in milliseconds
      .attr('y', (d: any) => y(d.value))
      .attr('height', (d: any) => this.height - y(d.value));

    this.svg.selectAll('.label')
      .data(this.data)
      .enter().append('text')
      .attr('class', 'label')
      .attr('x', (d: any) => x(d.category) + x.bandwidth() / 2)
      .attr('y', this.height)  // Start position for animation
      .attr('text-anchor', 'middle')
      .text((d: any) => Math.round(d.value) + "%")
      .transition()  // Start transition
      .duration(800)  // Duration of the animation in milliseconds
      .attr('y', (d: any) => y(d.value) - 5);
  }
}
