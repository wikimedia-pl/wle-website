var light = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© podkład mapowy <a href="http://cartodb.com/attributions#basemaps">CartoDB</a>, lic. <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>, dane <a href="http://www.openstreetmap.org/">OpenStreetMap</a>',
    opacity: 1
});

var dark = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© podkład mapowy <a href="http://cartodb.com/attributions#basemaps">CartoDB</a>, lic. <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>, dane <a href="http://www.openstreetmap.org/">OpenStreetMap</a>',
    opacity: 1
});

var gdos = L.tileLayer.wms("http://sdi.gdos.gov.pl/wms", {
    layers: 'SpecjalneObszaryOchrony,ObszarySpecjalnejOchrony,ZespolyPrzyrodniczoKrajobrazowe,ParkiKrajobrazowe',
    format: 'image/png',
    styles: 'soo$1$3,oso$1$3,zespoly$1$3,pk$1$3',
    transparent: true,
    attribution: "Generalna Dyrekcja Ochrony Środowiska"
});

var map = L.map('map', {
    center: [51.981, 20.067],
    zoom: 7,
    layers: [light, gdos],
    attributionControl: false
});
var hash = new L.Hash(map);

L.control.layers({
    "Jasna": light,
    "Ciemna": dark
}, {
    "Obszary" : gdos
}).addTo(map);

L.control.attribution({
    prefix: false
}).addTo(map);

var popup = L.popup();
function onMapClick(e) {
    // http://spatialreference.org/ref/epsg/etrs89-poland-cs92/
    // http://proj4js.org/

    var coor = proj4('WGS84', '+proj=tmerc +lat_0=0 +lon_0=19 +k=0.9993 +x_0=500000 +y_0=-5300000 +ellps=GRS80 +units=m +no_defs', [e.latlng.lng, e.latlng.lat]);
    var names = "";

    $.ajax({
        type: "GET",
        url: "proxy.php",
        data: {x: coor[0], y: coor[1]}
    })
            .done(function (rawData) {
                var data = $.parseJSON(rawData);
                for (var i = 0, max = data.length; i < max; i++) {
                    names += "<li>" + data[i].info.name + " <small>(" + data[i].layer + ")</small></li>";
                }

                if (data.length === 0) {
                    names = "<li>zupełnie nic</li>"
                }

                popup.setLatLng(e.latlng)
                        .setContent('<h4>' + e.latlng + '</h4><div>W tym miejscu:<br /><ul>' + names + '</ul></div>')
                        .openOn(map);
            })
            .fail(function (xhr, textStatus, errorThrown) {
                alert(xhr.responseText);
                alert(textStatus);
            });
}

map.on('click', onMapClick);