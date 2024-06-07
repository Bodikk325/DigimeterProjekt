import { Component, OnInit, Input, ElementRef, OnChanges, SimpleChanges, AfterViewInit, HostListener } from '@angular/core';

declare var d3: any;

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css']
})
export class PieChartComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() data1: any;
  @Input() data2: any;
  @Input() showLegend: boolean = false;

  private margin = { top: 20, right: 30, bottom: 40, left: 40 };
  private width = 300;
  private height = 300;
  private radius = Math.min(this.width, this.height) / 2;

  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    this.createCharts();
  }

  ngAfterViewInit(): void {
    this.createCharts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data1'] || changes['data2']) {
      this.createCharts();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.createCharts();
  }

  private createCharts(): void {
    const element = this.el.nativeElement.querySelector('.chart-container');
    element.innerHTML = ''; // Clear previous chart
  
    // Create two separate containers for the pie charts
    const container1 = d3.select(element).append('div').attr('class', 'pie-container w-full lg:w-1/2');
    const container2 = d3.select(element).append('div').attr('class', 'pie-container w-full lg:w-1/2');
  
    this.createPieChart(container1, this.data1);
    this.createPieChart(container2, this.data2);
  }
  
  private createPieChart(container: any, data: any): void {
    const svg = container.append('svg')
      .attr('width', '100%')
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .append('g')
      .attr('transform', `translate(${this.width / 2},${this.height / 2})`);
  
    const color = d3.scaleOrdinal(d3.schemeCategory10);
  
    const pie = d3.pie().value((d: any) => d.value).sort(null);
  
    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(this.radius);
  
    const arcs = svg.selectAll('arc')
      .data(pie(data))
      .enter().append('g')
      .attr('class', 'arc');
  
    arcs.append('path')
      .attr('d', arc)
      .attr('fill', (d: any, i: number) => color(i))
      .each(function (this: any, d: any) { this._current = d; }) // Store the initial angles
      .transition()
      .duration(800)
      .attrTween('d', function (d: any) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t: any) {
          return arc(interpolate(t));
        };
      });
  
    const total = data.reduce((acc: any, curr: any) => acc + curr.value, 0);
  
    arcs.append('text')
      .attr('transform', (d: any) => `translate(${arc.centroid(d)})`)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .text((d: any) => `${Math.round((d.data.value / total) * 100)}%`)
      .style('font-weight', 'bold');
  
    if (this.showLegend) {
      this.createLegend(svg, data, color);
    }
  }

  private createLegend(svg: any, data: any, color: any): void {
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${this.width / 2 + 20}, -${this.height / 2})`);

    const legendItems = legend.selectAll('.legend-item')
      .data(data)
      .enter().append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d: any, i: number) => `translate(0, ${i * 20})`);

    legendItems.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 10)
      .attr('height', 10)
      .style('fill', (d: any, i: number) => color(i));

    legendItems.append('text')
      .attr('x', 20)
      .attr('y', 10)
      .text((d: any) => d.category)
      .style('font-size', '12px')
      .style('text-anchor', 'start');
  }
}
