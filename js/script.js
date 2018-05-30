var itemcontrol = '';


var sections = [
    'living',
    'keuken',
    'slaapkamers',
    'tuin',
    'sanitair',
    'hal',
    'andere'
];

var categories = [
    'Living',
    'Keuken',
    'Slaapkamers',
    'Tuin',
    'Sanitair',
    'Hal',
    'Andere'
];

var totals = [
    0,
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
            },
            format: '€{y:.2f}'
        }
        }]
});

function init() {
    $('#inputModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget) // Button that triggered the modal
        var recipient = button.data('section') // Extract info from data-* attributes
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        var modal = $(this)
        modal.find('.modal-section').val(recipient)
    })
    $('#editModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget);
        var modal = $(this);
        modal.find('.modal-section-edit').val(button.data('section'));
        modal.find('.naam-edit').val(button.data('naam'));
        modal.find('.price-edit').val(button.data('price'));
        modal.find('.price-orig').val(button.data('price'));
        modal.find('.links-edit').val(button.data('links'));
        modal.find('.key-edit').val(button.data('key'));
    })
    getTemplate();
    for (var i = 0; i < sections.length; i++) {
        getFirebaseData(sections[i]);
    }
}

function getTemplate() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '../resources/itemtemplate.html', true);
    xhr.onreadystatechange = function () {
        if (this.readyState !== 4) return;
        if (this.status !== 200) return;
        itemcontrol = this.responseText;
    };
    xhr.send();
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

function removeFromFirebase(section, key) {
    var ref = firebase.app().database().ref(ref);
    ref.child(section).child(key).remove();
}

function updateHtml(snap, section) {
    var list = document.getElementById(section + 'data');
    if (snap != null) {
        Object.keys(snap).forEach(key => {
            var obj = snap[key];
            list.appendChild(generateListItem(obj, section, key));
            if (obj.price != '') {
                totals[sections.indexOf(section)] += parseFloat(obj.price);
            }
        });
        updateChart(section);
    }
    initPopover();
}

function updateChart(section) {
    chart.series[0].data[sections.indexOf(section)].update(totals[sections.indexOf(section)]);
    calculateTotal();
}

function calculateTotal() {
    var grandtotal = 0;
    var points = chart.series[0].points;
    for (var i = 0; i < points.length; i++) {
        grandtotal += parseFloat(points[i].y);
    }
    document.getElementById("grandtotal").innerHTML = '€' + Math.round(grandtotal * 100) / 100;
}

function generateListItem(obj, section, key) {
    var innerhtml = itemcontrol.replace(/SECTION/g, section);
    innerhtml = innerhtml.replace(/KEY/g, key);
    innerhtml = innerhtml.replace(/NAME/g, obj.name);
    innerhtml = innerhtml.replace(/PRICE/g, obj.price);
    innerhtml = innerhtml.replace(/LINKS/g, obj.links);
    innerhtml = innerhtml.replace(/LINKGROUP/g, generateLinkHtml(obj.links))
    var entry = document.createElement('div');
    entry.className = "card border-0";
    entry.setAttribute("id", key);
    entry.innerHTML = innerhtml;
    return entry;
}

function initPopover() {
    $("[data-toggle=confirmation]").confirmation({
        rootSelector: '[data-toggle=confirmation]',
        onConfirm: function (event, element) {
            var myElement = $("button[aria-describedby*='confirmation']")[0];
            deleteItem(myElement);
        },
        singleton: true,
        buttons: [
            {
                class: 'btn btn-danger',
                label: 'Ja, verwijderen'
            },
            {
                class: 'btn btn-primary',
                label: 'Nee',
                cancel: true
            }
        ]
    });
}

function generateLinkHtml(linktext) {
    var html = '';
    var links = linktext.split(/\r|\n/);
    var i;
    for (i = 0; i < links.length; i++) {
        if (links[i] != '') {
            html += '<li class="list-group-item"><a href="' + links[i] + '" target="_blank">' + links[i] + '</a></li>';
        }
    };
    return html;
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

function editItem() {
    var name = document.getElementById("naamEdit").value;
    var price = document.getElementById("priceEdit").value;
    var originalprice = document.getElementById("priceOrig").value;
    var links = document.getElementById("linksEdit").value;
    var section = document.getElementsByClassName("modal-section-edit")[0].value;
    var key = document.getElementsByClassName("key-edit")[0].value;
    document.getElementById("editform").reset();
    if (name != '') {
        var obj = {
            "name": name,
            "price": price,
            "links": links
        }
        var list = document.getElementById(section + 'data');
        var item = document.getElementById(key);
        list.replaceChild(generateListItem(obj, section, key), item);
        if (originalprice != '') {
            totals[sections.indexOf(section)] -= parseFloat(originalprice);
        }
        if (price != '') {
            totals[sections.indexOf(section)] += parseFloat(price);
        }
        var ref = firebase.app().database().ref(ref);
        var sectionref = ref.child(section);
        var itemref = sectionref.child(key);
        itemref.update(obj);
        updateChart(section);
        $('#editModal').modal('hide');
    }
    initPopover();
}

function deleteItem(item) {
    var list = document.getElementById(item.dataset.section + 'data');
    var listitem = item.parentElement.parentElement.parentElement.parentElement.parentElement
    if (item.dataset.price != '') {
        totals[sections.indexOf(item.dataset.section)] -= parseFloat(item.dataset.price);
    }
    updateChart(item.dataset.section);
    removeFromFirebase(item.dataset.section, item.dataset.key);
    list.removeChild(listitem);
}
