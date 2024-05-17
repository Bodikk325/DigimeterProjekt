import { Injectable } from '@angular/core';
import { ResultQuestion } from './result';
import { Point } from './firms.service';


declare var ApexCharts: any;

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  constructor() { }


  RenderCharts(results: ResultQuestion[], sortedPoints: Point[]) {
    var number = 0;
    results.forEach((element) => {
      var selected = sortedPoints.filter(x => x.questionId == element.questionId)[0].ShownPoint
      var second = 0
      if (selected != null) {
        if (typeof (selected) === "number") {
          second = (((selected) as number) / element.maxpoint) * 100;
          if (second < 5) second = 4
        }
      }

      var first = (element.points / element.maxpoint) * 100;
      if (first < 5 && first > 0) first = 4

      if (Number.isNaN(first)) {
        first = 0
      }

      if (Number.isNaN(second)) {
        second = 0
      }

      

      const options = {
        chart: {
          type: 'bar',
          toolbar: {
            show: false,
            autoSelected: 'zoom'
          }
        },
        series: [{
          name: 'pontszám',
          data: [first, second],
        }],
        tooltip: {
          y: {
            formatter: function (value: any) {
              return value < 5 ? '<5' : (value).toFixed(0) + '%';
            }
          }
        },
        yaxis: {
          labels: {
            formatter: function (value: any) {
              return (value).toFixed(0) + '%'; // Százalékban kifejezett érték
            }
          },
          min: 0, // Minimum érték
          max: 100, // Maximum érték
          tickAmount: 5 // Hány osztás legyen az Y-tengelyen
        },
        xaxis: {
          categories: ['Az ön vállalkozása', 'A többi cég a piacon'],
        },
        responsive: [
          {
            breakpoint: 760,
            options: {
              chart: {
                width: '50%'
              },
              legend: {
                position: 'bottom'
              }
            }
          }],
        dataLabels: {
          enabled: true,
          formatter: function (val: any) {
            if (val < 5) {
              return " < 5%"
            }
            else {
              return (val).toFixed(0) + '%'; // Százalékban formázott értékek, két tizedesjeggyel
            }
          },
          style: {
            colors: ['#fff'] // Adatcímkék színe
          }
        },
        plotOptions: {
          bar: {
            distributed: true, // Ez teszi lehetővé, hogy külön színe legyen minden oszlopnak
            columnWidth: '50%'
          }
        },
        colors: ['#3357FF', '#080729'], // Egyedi színek minden oszlophoz
        legend: {
          show: false // Itt tiltjuk le a jelmagyarázat megjelenését
        },
      };

      const chart = new ApexCharts(document.querySelector("#chart" + number), options);
      if (chart != null) {
        chart.render();
      }

      number += 1;
    });
  }

  RenderPieChart(userScore: number, categoryMaxPoint: number, firmAvaragePointByCategory: number, tabName: string) {

    var first1 = userScore;
    var second1 = categoryMaxPoint - userScore;

    var first2 = firmAvaragePointByCategory;
    var second2 = categoryMaxPoint - firmAvaragePointByCategory;

    if (tabName == "Értékesítés és marketing") {
      first1 = (userScore / categoryMaxPoint) * 100
      second1 = 100 - first1

      first2 = (firmAvaragePointByCategory / categoryMaxPoint) * 100
      second2 = 100 - first2
    }

    var chartOptions = {
      series: [first1, second1], // Ide kerülnek az adatok
      colors: ['#0072b5', '#080729'],
      chart: {
        width: 380,
        type: 'pie',
      },
      tooltip: {
        y: {
          formatter: function (value: any) {
            return Math.round(value) + '%';
          }
        }
      },
      labels: ['A te eredményed', 'Fejlődési lehetőség'], // Adatcímkék
      responsive: [
        {
          breakpoint: 760,
          options: {
            chart: {
              width: '90%'
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      ]
    };

    var chartOptions2 = {
      series: [first2, second2], // Ide kerülnek az adatok
      chart: {
        width: 380,
        type: 'pie',
      },
      tooltip: {
        y: {
          formatter: function (value: any) {
            return Math.round(value) + '%';
          }
        }
      },
      colors: ['#0072b5', '#080729'],
      labels: ['Más cégek', 'Fejlődési lehetőség'], // Adatcímkék
      responsive: [
        {
          breakpoint: 760,
          options: {
            chart: {
              width: '90%'
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      ]
    };

    const chart = new ApexCharts(document.querySelector("#piechart"), chartOptions);
    const chart2 = new ApexCharts(document.querySelector("#piechart2"), chartOptions2);

    chart.render();
    chart2.render();

  }

}
