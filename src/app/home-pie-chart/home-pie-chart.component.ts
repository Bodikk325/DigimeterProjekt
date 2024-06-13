import { Component, ElementRef, HostListener, Input, SimpleChanges } from '@angular/core';

declare var d3: any;

@Component({
  selector: 'app-home-pie-chart',
  templateUrl: './home-pie-chart.component.html',
  styleUrl: './home-pie-chart.component.css'
})
export class HomePieChartComponent {
  @Input() data1: any;

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
    if (changes['data1']) {
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
  
    // Create a container for the pie chart
    const container = d3.select(element).append('div').attr('class', 'pie-container w-full mx-auto');
  
    this.createPieChart(container, this.adjustData(this.data1));
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
    const svg = container.append('svg')
      .attr('width', '100%')
      .attr('height', this.height + 50) // Increase height for legend
      .attr('viewBox', `0 0 ${this.width + 200} ${this.height + 50}`) // Increase viewBox for legen
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
      .attr('stroke', 'white') // Add border to the pie slices
      .attr('stroke-width', '2px') // Set the border width
      .each(function (this: any, d: any) { this._current = d; })
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
      .style('fill', 'white'); // Change the label color to white
  
    // Ensure the legend creation is called after the arcs
    this.createLegend(svg, data, color);
  }
  
  private createLegend(svg: any, data: any, color: any): void {
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${this.width / 2 + 20}, ${this.height / 2 - data.length * 20 / 2})`); // Adjust position
  
    const legendItems = legend.selectAll('.legend-item')
      .data(data)
      .enter().append('g')
      .attr('class', 'legend-item')
      
      .style('font-weight', 'bold')
      .attr('transform', (d: any, i: number) => `translate(0, ${i * 20})`);
  
    legendItems.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 10)
      .attr('height', 10)
      .style('fill', (d: any, i: number) => color(i))
  
    legendItems.append('text')
      .attr('x', 20)
      .attr('y', 10)
      .text((d: any) => d.category)
      .style('font-size', '16px')
      .style('text-anchor', 'start');
  }
}
