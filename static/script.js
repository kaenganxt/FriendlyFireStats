let darkTheme = {
    colors: ['#2b908f', '#90ee7e', '#f45b5b', '#7798BF', '#aaeeee', '#ff0066',
        '#eeaaee', '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'],
    chart: {
        backgroundColor: {
            linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
            stops: [
                [0, '#2a2a2b'],
                [1, '#3e3e40']
            ]
        },
        style: {
            fontFamily: '\'Unica One\', sans-serif'
        },
        plotBorderColor: '#606063'
    },
    title: {
        style: {
            color: '#E0E0E3',
            textTransform: 'uppercase',
            fontSize: '20px'
        }
    },
    subtitle: {
        style: {
            color: '#E0E0E3',
            textTransform: 'uppercase'
        }
    },
    xAxis: {
        gridLineColor: '#707073',
        labels: {
            style: {
                color: '#E0E0E3'
            }
        },
        lineColor: '#707073',
        minorGridLineColor: '#505053',
        tickColor: '#707073',
        title: {
            style: {
                color: '#A0A0A3'
            }
        }
    },
    yAxis: {
        gridLineColor: '#707073',
        labels: {
            style: {
                color: '#E0E0E3'
            }
        },
        lineColor: '#707073',
        minorGridLineColor: '#505053',
        tickColor: '#707073',
        tickWidth: 1,
        title: {
            style: {
                color: '#A0A0A3'
            }
        }
    },
    tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        style: {
            color: '#F0F0F0'
        }
    },
    plotOptions: {
        series: {
            dataLabels: {
                color: '#F0F0F3',
                style: {
                    fontSize: '13px'
                }
            },
            marker: {
                lineColor: '#333'
            }
        },
        boxplot: {
            fillColor: '#505053'
        },
        candlestick: {
            lineColor: 'white'
        },
        errorbar: {
            color: 'white'
        }
    },
    legend: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        itemStyle: {
            color: '#E0E0E3'
        },
        itemHoverStyle: {
            color: '#FFF'
        },
        itemHiddenStyle: {
            color: '#606063'
        },
        title: {
            style: {
                color: '#C0C0C0'
            }
        }
    },
    credits: {
        style: {
            color: '#666'
        }
    },
    labels: {
        style: {
            color: '#707073'
        }
    },
    drilldown: {
        activeAxisLabelStyle: {
            color: '#F0F0F3'
        },
        activeDataLabelStyle: {
            color: '#F0F0F3'
        }
    },
    navigation: {
        buttonOptions: {
            symbolStroke: '#DDDDDD',
            theme: {
                fill: '#505053'
            }
        }
    },
    // scroll charts
    rangeSelector: {
        buttonTheme: {
            fill: '#505053',
            stroke: '#000000',
            style: {
                color: '#CCC'
            },
            states: {
                hover: {
                    fill: '#707073',
                    stroke: '#000000',
                    style: {
                        color: 'white'
                    }
                },
                select: {
                    fill: '#000003',
                    stroke: '#000000',
                    style: {
                        color: 'white'
                    }
                }
            }
        },
        inputBoxBorderColor: '#505053',
        inputStyle: {
            backgroundColor: '#333',
            color: 'silver'
        },
        labelStyle: {
            color: 'silver'
        }
    },
    navigator: {
        handles: {
            backgroundColor: '#666',
            borderColor: '#AAA'
        },
        outlineColor: '#CCC',
        maskFill: 'rgba(255,255,255,0.1)',
        series: {
            color: '#7798BF',
            lineColor: '#A6C7ED'
        },
        xAxis: {
            gridLineColor: '#505053'
        }
    },
    scrollbar: {
        barBackgroundColor: '#808083',
        barBorderColor: '#808083',
        buttonArrowColor: '#CCC',
        buttonBackgroundColor: '#606063',
        buttonBorderColor: '#606063',
        rifleColor: '#FFF',
        trackBackgroundColor: '#404043',
        trackBorderColor: '#404043'
    }
};

function setCookie(name,value,days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i=0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) ===' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

document.addEventListener("DOMContentLoaded", function() {

    let dark;
    let cookie = getCookie("colorScheme");
    if (cookie === "bright") {
        dark = false;
    } else if (cookie === "dark") {
        dark = true;
    } else {
        dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    let colorToggle = document.getElementById("toggleColor");
    if (dark) {
        colorToggle.innerText = "Bright mode";
        Highcharts.setOptions(darkTheme);
        document.body.classList.add("dark");
    }
    colorToggle.addEventListener("click", () => {
        if (colorToggle.innerText === "Bright mode") {
            setCookie("colorScheme", "bright", 30);
        } else {
            setCookie("colorScheme", "dark", 30);
        }
        window.location.reload();
    });

    let onlyStream = true;

    let switchButton = document.getElementById("streamShortcut");

    switchButton.addEventListener("click", function(e) {
        e.preventDefault();
        if (onlyStream) {
            chart.xAxis[0].setExtremes(null, null);
            switchButton.innerText = "Auf Stream-Zeit zoomen";
        } else {
            chart.xAxis[0].setExtremes(Date.parse('2022-12-03T12:00:00+01:00').valueOf(), Date.parse('2022-12-04T04:00:00+01:00').valueOf());
            switchButton.innerText = "Gesamten Verlauf anzeigen";
        }
        onlyStream = !onlyStream;
    });

    getSupportedYears();
    createChart();
    chart.xAxis[0].setExtremes(Date.parse('2022-12-03T12:00:00+01:00').valueOf(), Date.parse('2022-12-04T04:00:00+01:00').valueOf());
    setInterval(updateData, 1000 * 60);
});

let lastRequest = new Date();
let currentYear = lastRequest.getFullYear();
let data = {};
let chart;
let chart2;

let day_diffs = {2020: -2, 2021: -1};
//let colors = {2020: ["#743546", "#512531"], 2021: ["#f9ac3b", "#f8970a"], 2022: ["#75aca5", "#59958d"]};
let colors = {2020: "#75aca5", 2021: "#f9ac3b", 2022: "#743546"};

function createChart() {

    let textColor = "#000";
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        textColor = "#e0e0e3";
    }

    Highcharts.setOptions({
       lang: {
           decimalPoint: ",",
           months: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
           numericSymbols: ["Tsd", "Mio", "Mrd", "T", "P", "E"],
           shortMonths: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
           weekdays: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"]
       }
    });
    chart = Highcharts.chart('donations', {
        accessibility: {
            enabled: false
        },
        title: {
            text: "Spenden"
        },
        time: {
            useUTC: false
        },
        chart: {
            type: 'line',
            zoomType: 'x',
            panning: true,
            panKey: 'shift'
        },
        tooltip: {
            followTouchMove: false
        },
        xAxis: {
            type: 'datetime',
            events: {
                afterSetExtremes: function (event) {
                    const xMin = event.min;
                    const xMax = event.max;
                    const ex = chart2.xAxis[0].getExtremes();

                    if (ex.min !== xMin || ex.max !== xMax) chart2.xAxis[0].setExtremes(xMin, xMax, true, false);
                }
            }
        },
        yAxis: {
            title: {
                enabled: false
            },
            min: 0,
            opposite: true,
            crosshair: true,
            labels: {
                formatter: function () {
                    let value = this.value;
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
            },
            plotLines: [
                {
                    label: {
                        text: "Friendly Fire 1",
                        style: {
                            color: textColor
                        }
                    },
                    value: 125000,
                    dashStyle: "shortdash"
                },
                {
                    label: {
                        text: "Friendly Fire 2",
                        style: {
                            color: textColor
                        }
                    },
                    value: 310000,
                    dashStyle: "shortdash"
                },
                {
                    label: {
                        text: "Friendly Fire 3",
                        style: {
                            color: textColor
                        }
                    },
                    value: 477000,
                    dashStyle: "shortdash"
                },
                {
                    label: {
                        text: "Friendly Fire 4",
                        style: {
                            color: textColor
                        }
                    },
                    value: 620000,
                    dashStyle: "shortdash"
                },
                {
                    label: {
                        text: "Friendly Fire 5",
                        style: {
                            color: textColor
                        }
                    },
                    value: 730000,
                    dashStyle: "shortdash"
                },
                {
                    label: {
                        text: "Friendly Fire 6",
                        style: {
                            color: textColor
                        }
                    },
                    value: 1052548,
                    dashStyle: "shortdash"
                },
                {
                    label: {
                        text: "Friendly Fire 7",
                        style: {
                            color: textColor
                        }
                    },
                    value: 1284386,
                    dashStyle: "shortdash"
                }
            ]
        }
    });

    chart2 = Highcharts.chart('donation_count', {
        accessibility: {
            enabled: false
        },
        title: {
            text: "Anzahl der Spenden und Spender"
        },
        time: {
            useUTC: false
        },
        chart: {
            type: 'line',
            zoomType: 'x',
            panning: true,
            panKey: 'shift'
        },
        tooltip: {
            followTouchMove: false
        },
        xAxis: {
            type: 'datetime',
            events: {
                afterSetExtremes: function (event) {
                    const xMin = event.min;
                    const xMax = event.max;
                    const ex = chart.xAxis[0].getExtremes();

                    if (ex.min !== xMin || ex.max !== xMax) chart.xAxis[0].setExtremes(xMin, xMax, true, false);
                }
            }
        },
        yAxis: {
            title: {
                enabled: false
            },
            min: 0,
            opposite: true,
            crosshair: true
        }
    });
}

function updateChart(year) {
    let render_data = [];
    let render_data_donations = [];
    let render_data_donors = [];
    let i = 0;
    for (let date of data[year]) {
        i++;
        let date_date = new Date(date.updated_at);
        // Adjust day difference so the lines can overlap
        if (year !== currentYear) {
            let new_date = date_date.getDate() + day_diffs[year];
            if (new_date < 1) {
                date_date.setMonth(date_date.getMonth() - 1);
                new_date = 30 + new_date;
            }
            date_date.setDate(new_date);
            date_date.setFullYear(currentYear);
        }
        render_data.push([date_date.valueOf(), date.donated_amount_in_cents / 100]);
        render_data_donations.push([date_date.valueOf(), date.donations_count]);
        render_data_donors.push([date_date.valueOf(), date.donor_count]);
    }

    let series = chart.get(year + "");
    let count = chart2.get(year + "_count");
    let donors = chart2.get(year + "_donors");

    if (series) {
        series.setData(render_data);
        count.setData(render_data_donations);
        donors.setData(render_data_donors);
    } else {
        chart.addSeries({
            data: render_data,
            id: year + "",
            name: year,
            legendIndex: year - 2020,
            color: colors[year]
        });
        chart2.addSeries({
            data: render_data_donations,
            id: year + "_count",
            name: year + " Spenden",
            legendIndex: (year - 2020) * 2,
            color: colors[year]
        });
        chart2.addSeries({
            data: render_data_donors,
            id: year + "_donors",
            name: year + " Spender",
            legendIndex: (year - 2020) * 2 + 1,
            dashStyle: "shortdot",
            color: colors[year]
        });
    }
}

function updateData(year) {
    if (typeof year === "undefined") {
        year = currentYear;
    }
    let query = "";
    if (currentYear === year) {
        query = "?last_request=" + encodeURIComponent(lastRequest.toISOString());
        lastRequest = new Date();
    }

    ajax("/api/donations/" + year + query).then(function(response) {
        if (response.state === "RELOAD") {
            window.location.reload();
        } else {
            data[year] = response.donations;
            updateChart(year);

            if (year === currentYear) {
                let amount;
                if (response.donations.length === 0) {
                    amount = 0;
                } else {
                    let latest = response.donations[response.donations.length - 1];
                    amount = latest.donated_amount_in_cents;
                }
                let str = (amount / 100) + " €";
                str = str.replace(".", ",");
                document.getElementById("currentAmount").innerText = str;
            } else {
                chart.get(year + "").hide();
                chart2.get(year + "_count").hide();
                chart2.get(year + "_donors").hide();
            }
        }
    });
}

function getSupportedYears() {
    ajax("/api/years").then(function(years) {
        for (let year of years) {
            updateData(year);
        }
    });
}

function ajax(url, method = "GET", data = "", tryJson = true) {
    return new Promise((resolve, reject) => {
        const httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = function() {
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
                if (httpRequest.status === 200) {
                    let response = httpRequest.responseText;
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
