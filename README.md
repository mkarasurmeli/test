# Arcgis Custom Widgets from Layermark
test2

## Street View Widget

    const streetView = new StreetViewWidget({
        view: mapView,
        streetViewNode : document.getElementById("streetDiv")
    });
        
    mapView.ui.add(streetView, 'top-left');

test