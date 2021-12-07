document.addEventListener("DOMContentLoaded", function() {

    document.getElementById("streamShortcut").addEventListener("click", function(e) {
        e.preventDefault();

        chart.zoomX(Date.parse('2021-12-04T12:00:00+01:00'), Date.parse('2021-12-05T04:00:00+01:00'));
        chart2.zoomX(Date.parse('2021-12-04T12:00:00+01:00'), Date.parse('2021-12-05T04:00:00+01:00'));
    });

    getSupportedYears();
    updateData();
    createChart();
    //setInterval(updateData, 1000 * 60);
});

let lastRequest = new Date();
let currentYear = lastRequest.getFullYear();
let yearsLoaded = [currentYear];
let data = {};
let chart;
let chart2;

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
                show: true,
            },
            zoom: {
                enabled: true,
            }
        },
        colors: ["#faa422", "#35B289"],
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'stepline',
            dashArray: [0, 4],
        },
        title: {
            text: 'Spendenfortschritt',
            align: 'left'
        },
        markers: {
            size: 0
        },
        xaxis: {
            type: 'datetime',
            labels: {
                datetimeUTC: false
            }
        },
        yaxis: {
            opposite: true,
            labels: {
                align: "right",
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
                format: "dd.M HH:mm"
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

    let options2 = {
        series: [],
        chart: {
            id: 'donation_count',
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
                show: false
            },
            zoom: {
                enabled: true,
            }
        },
        colors: ["#faa422", "#35B289"],
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'stepline',
            dashArray: [0, 0, 4, 4],
        },
        title: {
            text: 'Anzahl der Spenden und Spender',
            align: 'left'
        },
        markers: {
            size: 0
        },
        xaxis: {
            type: 'datetime',
            labels: {
                datetimeUTC: false
            }
        },
        yaxis: {
            opposite: true,
            labels: {
                align: "right"
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
                format: "dd.M HH:mm"
            }
        },
        theme: {
            mode: "light",
            palette: 'palette1'
        }
    };

    chart = new ApexCharts(document.querySelector("#donations"), options);
    chart.render();

    chart2 = new ApexCharts(document.querySelector("#donation_count"), options2);
    chart2.render();
}

function updateChart(year) {
    let render_data = [];
    let render_data_donations = [];
    let render_data_donors = [];
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
        render_data_donations.push([date_date, date.donations_count]);
        render_data_donors.push([date_date, date.donor_count]);
    }

    let series = chart.w.config.series;
    let series_donations = chart2.w.config.series;

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

    chart.updateHelpers._updateSeries(newData, true);

    let newData2 = [];
    let donations_oldId = series_donations.length;
    let donors_oldId = series_donations.length+1;
    for (let id in series_donations) {
        if (series_donations[id].name == year + "_donations") {
            donations_oldId = id;
        } else if (series_donations[id].name == year + "_donors") {
            donors_oldId = id;
        } else {
            newData2[id] = series_donations[id];
        }
    }
    newData2[donations_oldId] = {
        name: year + "_donations",
        data: render_data_donations
    };
    newData2[donors_oldId] = {
        name: year + "_donors",
        data: render_data_donors
    };

    chart2.updateHelpers._updateSeries(newData2, true);
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
        chart2.showSeries(year + "_donations");
        chart2.showSeries(year + "_donors");
        updateChart(year);
    } else {
        chart.hideSeries(year);
        chart2.hideSeries(year + "_donations");
        chart2.hideSeries(year + "_donors");
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

            if (year == currentYear) {
                let latest = response.donations[response.donations.length - 1];
                let amount = latest.donated_amount_in_cents;
                let str = (amount / 100) + " €";
                str = str.replace(".", ",");
                document.getElementById("currentAmount").innerText = str;
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
