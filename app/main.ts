import EsriMap from "esri/Map";
import MapView from "esri/views/MapView";
import StreetView from "./StreetViewWidget";

const map = new EsriMap({
    basemap: "streets"
});

const view = new MapView({
    map: map,
    container: "viewDiv",
    center: [-118.244, 34.052],
    zoom: 12
});

const streetView = new StreetView({view:view,streetViewNode:document.getElementById("streetDiv")});

view.ui.add(streetView,'top-left')