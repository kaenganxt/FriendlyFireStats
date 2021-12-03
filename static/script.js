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
            id: 'donation_amount',
            group: "friendlyfire",
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
                    min: Date.parse(currentYear + '-12-04T12:00:00+01:00'),
                    max: Date.parse(currentYear + '-12-05T12:00:00+01:00'),
                }
            }
        },
        colors: ["#faa422", "#35B289"],
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'stepline',
            dashArray: [0, 8],
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
            opposite: true,
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
            palette: 'palette1'
        },
        annotations: {
            yaxis: [
            {
                y: 170000,
                borderColor: '#038C5F',
                label: {
                    borderWidth: 0,
                    position: "left",
                    style: {
                        color: '#fff',
                        background: '#038C5F'
                    },
                    text: 'Friendly Fire 1',
                    offsetY: 15,
                    offsetX: 75
                }
            },
            {
                y: 200000,
                borderColor: '#038C5F',
                label: {
                    borderWidth: 0,
                    position: "left",
                    style: {
                        color: '#fff',
                        background: '#038C5F'
                    },
                    text: 'Friendly Fire 2',
                    offsetX: 75
                }
            },
            {
                y: 470000,
                borderColor: '#038C5F',
                label: {
                    borderWidth: 0,
                    position: "left",
                    style: {
                        color: '#fff',
                        background: '#038C5F'
                    },
                    text: 'Friendly Fire 3',
                    offsetX: 75
                }
            },
            {
                y: 620000,
                borderColor: '#038C5F',
                label: {
                    borderWidth: 0,
                    position: "left",
                    style: {
                        color: '#fff',
                        background: '#038C5F'
                    },
                    text: 'Friendly Fire 4',
                    offsetX: 75
                }
            },
            {
                y: 730000,
                borderColor: '#038C5F',
                label: {
                    borderWidth: 0,
                    position: "left",
                    style: {
                        color: '#fff',
                        background: '#038C5F'
                    },
                    text: 'Friendly Fire 5',
                    offsetX: 75
                }
            },
            {
                y: 1052548,
                borderColor: '#35B289',
                label: {
                    borderWidth: 0,
                    position: "left",
                    style: {
                        color: '#fff',
                        background: '#35B289'
                    },
                    text: 'Friendly Fire 6',
                    offsetX: 75
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
    let oldId = series.length;
    for (let id in series) {
        if (series[id].name != year) {
            newData[id] = series[id];
        } else {
            oldId = id;
        }
    }
    newData[oldId] = {
        name: year,
        data: render_data
    };

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
