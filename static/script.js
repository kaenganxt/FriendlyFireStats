document.addEventListener("DOMContentLoaded", function() {

    getSupportedYears();
    updateData();
    createChart();
    setInterval(updateData, 1000 * 60 * 2);
});

let lastRequest = new Date();
let currentYear = lastRequest.getFullYear();
let yearsLoaded = [currentYear];
let data = {};
let chart;

let day_diffs = {2020: -1};

function createChart() {
    let options = {
        series: [],
        chart: {
            id: 'realtime',
            height: 350,
            type: 'line',
            animations: {
                enabled: true,
                easing: 'easein',
                dynamicAnimation: {
                    speed: 500
                }
            },
            toolbar: {
                show: true
            },
            zoom: {
                enabled: true
            },
            selection: {
                xaxis: {
                    min: Date.parse('04 Dec ' + currentYear + ' 12:00:00 CET'),
                    max: Date.parse('05 Dec ' + currentYear + ' 12:00:00 CET'),
                }
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth'
        },
        title: {
            text: 'Friendly Fire Spendenfortschritt',
            align: 'left'
        },
        markers: {
            size: 0
        },
        xaxis: {
            type: 'datetime'
        },
        yaxis: {
            labels: {
                formatter: function (value) {
                    if (!value) {
                        return value + " €";
                    }
                    if (value >= 1000000) {
                        return (value/1000000).toFixed(2) + " Mio €";
                    } else if (value >= 1000) {
                        return (value/1000).toFixed(1) + " Tsd €";
                    }
                    return value.toFixed(0) + " €";
                }
            }
        },
        legend: {
            show: false
        },
        grid: {
            xaxis: {
                lines: {
                    show: true
                }
            }
        },
        tooltip: {
            x: {
                format: "HH:mm"
            }
        },
        theme: {
            mode: "light",
            monochrome: {
                enabled: true,
                color: "#faa422",

            }
        },
        annotations: {
            yaxis: [
            {
                y: 170000,
                borderColor: '#D27E05',
                label: {
                    borderColor: '#D27E05',
                    style: {
                        color: '#fff',
                        background: '#D27E05'
                    },
                    text: 'Friendly Fire 1',
                    offsetY: 15
                }
            },
            {
                y: 200000,
                borderColor: '#D27E05',
                label: {
                borderColor: '#D27E05',
                style: {
                    color: '#fff',
                    background: '#D27E05'
                },
                text: 'Friendly Fire 2'
                }
            },
            {
                y: 470000,
                borderColor: '#D27E05',
                label: {
                borderColor: '#D27E05',
                style: {
                    color: '#fff',
                    background: '#D27E05'
                },
                text: 'Friendly Fire 3'
                }
            },
            {
                y: 620000,
                borderColor: '#D27E05',
                label: {
                borderColor: '#D27E05',
                style: {
                    color: '#fff',
                    background: '#D27E05'
                },
                text: 'Friendly Fire 4'
                }
            },
            {
                y: 730000,
                borderColor: '#D27E05',
                label: {
                borderColor: '#D27E05',
                style: {
                    color: '#fff',
                    background: '#D27E05'
                },
                text: 'Friendly Fire 5'
                }
            },
            {
                y: 1052548,
                borderColor: '#fab142',
                label: {
                borderColor: '#fab142',
                style: {
                    color: '#fff',
                    background: '#fab142'
                },
                text: 'Friendly Fire 6'
                }
            }
            ]
        }
    };

    chart = new ApexCharts(document.querySelector("#donations"), options);
    chart.render();
}

function updateChart(year) {
    let render_data = [];
    for (let date of data[year]) {
        let date_date = new Date(date.updated_at);
        // Adjust day difference so the lines can overlap
        if (year != currentYear) {
            let new_date = date_date.getDate() + day_diffs[year];
            if (new_date < 1) {
                date_date.setMonth(date_date.getMonth() - 1);
                new_date = 30 + new_date;
            }
            date_date.setDate(new_date);
            date_date.setFullYear(currentYear);
        }
        render_data.push([date_date, date.donated_amount_in_cents / 100]);
    }

    let series = chart.w.config.series;
    let newData = [];
    for (let data of series) {
        if (data.name != year) {
            newData.push(data);
        }
    }
    newData.push({
        name: year,
        data: render_data
    });

    chart.updateSeries(newData);
}

function setSeriesVisibility(year, visible) {
    if (yearsLoaded.indexOf(year) == -1) {
        if (visible) {
            updateData(year);
        }
        return;
    }
    if (visible) {
        chart.showSeries(year);
    } else {
        chart.hideSeries(year);
    }
}

function updateData(year) {
    if (typeof year === "undefined") {
        year = currentYear;
    }
    let query = "";
    if (currentYear == year) {
        query = "?last_request=" + encodeURIComponent(lastRequest.toISOString());
        lastRequest = new Date();
    }

    ajax("/api/donations/" + year + query).then(function(response) {
        if (response.state === "RELOAD") {
            window.location.reload();
        } else {
            data[year] = response.donations;
            updateChart(year);
            if (yearsLoaded.indexOf(year) == -1) {
                yearsLoaded.push(year);
            }
        }
    });
}

function getSupportedYears() {
    ajax("/api/years").then(function(years) {
        let year_elems = document.getElementById("years");
        year_elems.innerText = "";
        for (let year of years) {
            let new_elem = document.createElement("li");
            new_elem.classList.add("yearSelect");
            new_elem.innerText = year;
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.onchange = function() {
                setSeriesVisibility(year, checkbox.checked);
            };
            if (year == currentYear) {
                checkbox.checked = "checked";
            }
            new_elem.prepend(checkbox),

            year_elems.append(new_elem);
        }
    });
}

function ajax(url, method = "GET", data = "", tryJson = true) {
    return new Promise((resolve, reject) => {
        var httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = function() {
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
                if (httpRequest.status === 200) {
                    var response = httpRequest.responseText;
                    if (tryJson) {
                        try {
                            response = JSON.parse(response);
                        } catch (e) {}
                    }
                    resolve(response);
                } else {
                    reject();
                }
            }
        };
        httpRequest.open(method, url, true);
        if (method === "POST") {
            httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            httpRequest.send(data);
        } else {
            httpRequest.send();
        }
    });
}
