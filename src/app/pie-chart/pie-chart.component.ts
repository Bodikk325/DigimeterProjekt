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

    // Create two separate containers for each pie chart and its legend
    const container1 = d3.select(element).append('div').attr('class', 'pie-chart-container mt-10');
    const container2 = d3.select(element).append('div').attr('class', 'pie-chart-container mt-10');

    this.createPieChart(container1, this.adjustData(this.data1));
    this.createPieChart(container2, this.adjustData(this.data2));
  }

  private adjustData(data: any): any {
    const total = data.reduce((acc: any, curr: any) => acc + curr.value, 0);
    const minValue = total * 0.05; // 5% of the total
    let adjustedData = data.map((d: any) => ({
      category: d.category,
      value: Math.max(d.value, minValue)
    }));

    const adjustedTotal = adjustedData.reduce((acc: any, curr: any) => acc + curr.value, 0);
    const scalingFactor = total / adjustedTotal;

    return adjustedData.map((d: any) => ({
      category: d.category,
      value: d.value * scalingFactor
    }));
  }

  private createPieChart(container: any, data: any): void {

    const isMobile = window.innerWidth <= 1024;

    const svg = container.append('svg')
      .attr('width', '100%')
      .attr('height', isMobile ? '150px' : '300px')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .append('g')
      .attr('transform', `translate(${this.width / 2},${this.height / 2})`);

    const customColors = ['#775ad2', '#0072b5']; // Add your custom colors here
    const color = d3.scaleOrdinal(customColors);

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
      .attr('stroke', 'white') // Add border to the pie slices
      .attr('stroke-width', '2px') // Set the border width
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
      .text((d: any) => {
        const percentage = (d.data.value / total) * 100;
        if (percentage < 5) {
          return '<5%';
        } else if (percentage > 95) {
          return '>95%';
        } else {
          return `${Math.round(percentage)}%`;
        }
      })
      .style('font-weight', 'bold')
      .style('fill', 'white');

    if (this.showLegend) {
      this.createLegend(container, data, color);
    }
  }

  private createLegend(container: any, data: any, color: any): void {
    const legend = container.append('div')
      .attr('class', 'legend')
      .style('display', 'flex')
      .style('flex-direction', 'column')
      .style('justify-content', 'center')
      .style('margin-top', '10px');

    const legendItems = legend.selectAll('.legend-item')
      .data(data)
      .enter().append('div')
      .attr('class', 'legend-item')
      .style('display', 'flex')
      .style('align-items', 'center')
      .style('margin-right', '10px');

    legendItems.append('div')
      .style('width', '10px')
      .style('height', '10px')
      .style('background-color', (d: any, i: number) => color(i))
      .style('margin-right', '5px');

    legendItems.append('div')
      .text((d: any) => d.category)
      .style('font-size', '12px');
  }
}
