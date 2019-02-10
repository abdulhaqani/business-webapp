var prev_handler = window.onload;
window.onload = function () {
    if (prev_handler) {
        prev_handler();
    }
    createCharts();
};

function createCharts () {

    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const data = JSON.parse(xhttp.responseText);

            console.log(data);

            Highcharts.chart('c1', {

                title: {
                    text: 'All Time Expenses'
                },

                // subtitle: {
                //     text: 'abc123'
                // },

                yAxis: {
                    title: {
                        text: 'Total Expenses ($USD)'
                    }
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle'
                },

                plotOptions: {
                    series: {
                        label: {
                            connectorAllowed: false
                        },
                        pointStart: 2010
                    }
                },

                series: [{
                    name: 'Installation',
                    data: data,
                }],

                responsive: {
                    rules: [{
                        condition: {
                            maxWidth: 500
                        },
                        chartOptions: {
                            legend: {
                                layout: 'horizontal',
                                align: 'center',
                                verticalAlign: 'bottom'
                            }
                        }
                    }]
                }

            });

        }
    };
    xhttp.open("GET", "/data/expenses", true);
    xhttp.send();
}