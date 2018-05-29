var itemcontrol = '<div class="card-header p-0 border-bottom rounded-0 bg-white"><div class="navbar navbar-default p-0"><ul class="nav navbar-nav"><li><button class="btn btn-block btn-link text-left p-1" id="headingKEY" type="button" data-toggle="collapse" data-target="#collapseKEY" aria-expanded="false" aria-controls="collapseKEY">NAME</button></li></ul><form class="form-inline"><button class="btn btn-link" data-toggle="modal" data-target="#editModal" data-section="SECTION">* aanpassen</button><button class="btn btn-link">- verwijderen</button></form></div></div><div id="collapseKEY" class="collapse border-top" aria-labelledby="headingKEY" data-parent="#SECTIONdata"><div class="card-body p-2"><form><div class="form-row "><div class="col-2 justify-content-center align-items-center mx-auto"><div class="display-4">€PRICE</div></div><div class="col"><textarea type="text" class="form-control" placeholder="Links" rows=5></textarea></div></div></form></div></div>';


var sections = [
    'living',
    'keuken',
    'slaapkamers',
    'tuin',
    'hal',
    'andere'
];

var categories = [
    'Living',
    'Keuken',
    'Slaapkamers',
    'Tuin',
    'Hal',
    'Andere'
];

var totals = [
    0,
    0,
    0,
    0,
    0,
    0
];

var chart = Highcharts.chart('dashboardchart', {
    chart: {
        type: 'column'
    },
    title: '',
    exporting: {
        enabled: false
    },
    xAxis: {
        categories: categories,
        labels: {
            style: {
                fontSize: '13px',
                fontFamily: 'Segoe UI, sans-serif'
            }
        }
    },
    yAxis: {
        min: 0,
        title: {
            text: ''
        },
        labels: {
            style: {
                fontSize: '13px',
                fontFamily: 'Segoe UI, sans-serif'
            }
        }
    },
    legend: {
        enabled: false
    },
    tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true,
        enabled: false
    },
    plotOptions: {
        column: {
            pointPadding: 0,
            borderWidth: 0
        },
        series: {
            states: {
                hover: {
                    enabled: false
                }
            }
        }
    },
    credits: {
        enabled: false
    },
    series: [{
        name: '',
        data: totals,
        dataLabels: {
            enabled: true,
            style: {
                fontSize: '13px',
                fontFamily: 'Segoe UI, sans-serif'
            }
        }
        }]
});


function init() {
    for (var i = 0; i < sections.length; i++) {
        getFirebaseData(sections[i]);
    }
}

function saveToFirebase(ref, object) {
    var pushref = firebase.database().ref(ref).push(object);
    var key = pushref.key;
    updateHtml({
        [key]: object
    }, ref);
}

function getFirebaseData(section) {
    var ref = firebase.app().database().ref(ref);
    var childref = ref.child(section);
    childref.once('value').then(function (snap) {
        updateHtml(snap.val(), section);
    });
}

function updateHtml(snap, section) {
    var list = document.getElementById(section + 'data');
    if (snap != null) {
        Object.keys(snap).forEach(key => {
            var obj = snap[key];
            var innerhtml = itemcontrol.replace(/SECTION/g, section);
            innerhtml = innerhtml.replace(/KEY/g, key);
            innerhtml = innerhtml.replace(/NAME/g, obj.name);
            innerhtml = innerhtml.replace(/PRICE/g, obj.price);
            innerhtml = innerhtml.replace(/LINKS/g, obj.links);
            var entry = document.createElement('div');
            entry.className = "card border-0";
            entry.setAttribute("id", key);
            entry.innerHTML = innerhtml;
            list.appendChild(entry);
            if (obj.price != '') {
                totals[sections.indexOf(section)] += parseFloat(obj.price);
            }
        });
        chart.series[0].data[sections.indexOf(section)].update(totals[sections.indexOf(section)]);
        var grandtotal = 0;
        var points = chart.series[0].points;
        for (var i = 0; i < points.length; i++) {
            grandtotal += parseFloat(points[i].y);
        }
        document.getElementById("grandtotal").innerHTML = '€' + grandtotal;
    }
}

function addItem() {
    var name = document.getElementById("naamInput").value;
    var price = document.getElementById("priceInput").value;
    var links = document.getElementById("linksInput").value;
    var section = document.getElementsByClassName("modal-section")[0].value;
    document.getElementById("inputform").reset();
    if (name != '') {
        saveToFirebase(section, {
            "name": name,
            "price": price,
            "links": links
        });
        $('#inputModal').modal('hide');
    }
}
