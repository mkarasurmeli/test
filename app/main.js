var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "esri/Map", "esri/views/MapView", "./StreetViewWidget"], function (require, exports, Map_1, MapView_1, StreetViewWidget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Map_1 = __importDefault(Map_1);
    MapView_1 = __importDefault(MapView_1);
    StreetViewWidget_1 = __importDefault(StreetViewWidget_1);
    var map = new Map_1.default({
        basemap: "streets"
    });
    var view = new MapView_1.default({
        map: map,
        container: "viewDiv",
        center: [-118.244, 34.052],
        zoom: 12
    });
    var streetView = new StreetViewWidget_1.default({ view: view, streetViewNode: document.getElementById("streetDiv") });
    view.ui.add(streetView, 'top-left');
});
//# sourceMappingURL=main.js.map