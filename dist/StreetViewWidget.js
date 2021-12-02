/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "https://streetsmart.cyclomedia.com/api/v19.18/StreetSmartApi.js", "esri/Color", "esri/geometry/Point", "esri/layers/GraphicsLayer", "esri/symbols/SimpleMarkerSymbol", "esri/Graphic", "esri/symbols/SimpleFillSymbol", "esri/geometry/Polygon"], function (require, exports, __extends, __decorate, decorators_1, Widget, widget_1, StreetSmartApi, Color_1, Point_1, GraphicsLayer_1, SimpleMarkerSymbol_1, Graphic_1, SimpleFillSymbol_1, Polygon_1) {
    "use strict";
    Color_1 = __importDefault(Color_1);
    Point_1 = __importDefault(Point_1);
    GraphicsLayer_1 = __importDefault(GraphicsLayer_1);
    SimpleMarkerSymbol_1 = __importDefault(SimpleMarkerSymbol_1);
    Graphic_1 = __importDefault(Graphic_1);
    SimpleFillSymbol_1 = __importDefault(SimpleFillSymbol_1);
    Polygon_1 = __importDefault(Polygon_1);
    var StreetView = /** @class */ (function (_super) {
        __extends(StreetView, _super);
        function StreetView(params) {
            var _this = _super.call(this) || this;
            _this.recordLayer = new GraphicsLayer_1.default();
            _this.viewLayer = new GraphicsLayer_1.default({ minScale: 10000 });
            _this.view = params.view;
            _this.streetViewNode = params.streetViewNode;
            _this.initializeStreetView();
            return _this;
        }
        StreetView.prototype.activate = function () {
            var _this = this;
            this.clickHandle = this.view.on("click", function (evt) {
                _this.viewer.openByCoordinate([evt.mapPoint.longitude, evt.mapPoint.latitude], "EPSG:4326");
            });
            this.viewpointWatchHandle = this.view.watch("viewpoint", function () {
                _this.updateGraphic();
            });
            this.view.map.add(this.recordLayer);
            this.view.map.add(this.viewLayer);
        };
        StreetView.prototype.deactivate = function () {
            if (this.clickHandle) {
                this.clickHandle.remove();
                this.clickHandle = null;
            }
            if (this.viewpointWatchHandle) {
                this.viewpointWatchHandle.remove();
                this.viewpointWatchHandle = null;
            }
            this.view.map.remove(this.recordLayer);
            this.view.map.remove(this.viewLayer);
        };
        StreetView.prototype.initializeStreetView = function () {
            var _this = this;
            StreetSmartApi.init({
                targetElement: this.streetViewNode,
                username: "Durmus.Cesur@dcwater.com",
                password: "tsJd83Tw1",
                apiKey: "y3YVWPQVyHsZS78NO_wxuTkZebQ1WDwN6r4py7kJy7wN-X4xGXw1qfc9aTExa7Q",
                srs: "EPSG:4326",
                locale: "en-us",
                configurationUrl: "https://atlas.cyclomedia.com/configuration",
                addressSettings: {
                    locale: "en",
                    database: "Nokia"
                }
            }).then(function () {
                console.log("Api: init: success!");
                var viewerType = StreetSmartApi.ViewerType.PANORAMA;
                StreetSmartApi.open("WE13AUFB", {
                    viewerType: viewerType,
                    srs: "EPSG:4326",
                }).then(function (result) {
                    if (result && result.length > 0) {
                        _this.viewer = result[0];
                        _this.viewer.on("VIEW_CHANGE", function (details) {
                            var recording = _this.viewer.getRecording();
                            _this.view.goTo([recording.xyz[0], recording.xyz[1]]);
                            _this.updateGraphic();
                        });
                        _this.viewer.on("RECORDING_CLICK", function () {
                            _this.updateGraphic();
                        });
                        _this.viewer.on("IMAGE_CHANGE", function () {
                            _this.updateGraphic();
                        });
                        window.panoramaViewer = _this.viewer;
                    }
                }).catch(function (reason) {
                    console.log("Failed to create component(s) through API: " + reason);
                });
            }, function (err) {
                console.log("Api: init: failed. Error: ", err);
            });
        };
        StreetView.prototype.render = function () {
            return (widget_1.tsx("div", { bind: this, onclick: this._toggleStreetView },
                widget_1.tsx("div", { class: "esri-widget--button esri-widget esri-interactive", style: this.isActive ? "background:lightskyblue;" : "", role: "button", title: "Street Viewer" },
                    widget_1.tsx("span", { class: "esri-icon-media" }),
                    widget_1.tsx("span", { class: "esri-icon-font-fallback-text" }, "Street Viewer"))));
        };
        StreetView.prototype._toggleStreetView = function () {
            this.isActive = !this.isActive;
            if (this.isActive) {
                this.activate();
            }
            else {
                this.deactivate();
            }
        };
        StreetView.prototype.updateGraphic = function () {
            if (this.viewer == null) {
                return;
            }
            var recording = this.viewer.getRecording();
            if (!recording || !recording.xyz) {
                return;
            }
            var x = recording.xyz[0];
            var y = recording.xyz[1];
            if (!x || !y) {
                return;
            }
            this.recordLayer.removeAll();
            this.viewLayer.removeAll();
            var viewerColor = Color_1.default.fromArray(this.viewer.getViewerColor());
            var point = new Point_1.default({ longitude: x, latitude: y });
            // Street Smart API returns orientation in degrees.
            var _a = this.viewer.getOrientation(), yaw = _a.yaw, hFov = _a.hFov;
            // we need to use it in radians.
            yaw = this.toRadians(yaw);
            hFov = this.toRadians(hFov);
            var factor = 70;
            var hhFov = hFov * 0.5;
            var leftFovX = Math.sin(yaw - hhFov) * factor;
            var leftFovY = -Math.cos(yaw - hhFov) * factor;
            var rightFovX = Math.sin(yaw + hhFov) * factor;
            var rightFovY = -Math.cos(yaw + hhFov) * factor;
            var screenPoint = this.view.toScreen(point);
            var mapPoint = this.view.toMap(screenPoint);
            var left = this.view.toMap({ x: screenPoint.x + leftFovX, y: screenPoint.y + leftFovY });
            var right = this.view.toMap({ x: screenPoint.x + rightFovX, y: screenPoint.y + rightFovY });
            var recordSymbol = new SimpleMarkerSymbol_1.default({
                style: 'circle',
                color: viewerColor,
                size: 11
            });
            var record = new Graphic_1.default({ geometry: point, symbol: recordSymbol });
            this.recordLayer.add(record);
            //const outline = new SimpleLineSymbol();
            var symbol = new SimpleFillSymbol_1.default();
            var polygon = new Polygon_1.default({
                rings: [[[mapPoint.x, mapPoint.y], [left.x, left.y], [right.x, right.y], [mapPoint.x, mapPoint.y]]],
                spatialReference: this.view.spatialReference
            });
            var graphic = new Graphic_1.default({ geometry: polygon, symbol: symbol });
            this.viewLayer.add(graphic);
        };
        StreetView.prototype.toRadians = function (deg) {
            return deg * (Math.PI / 180.0);
        };
        __decorate([
            decorators_1.property()
        ], StreetView.prototype, "view", void 0);
        __decorate([
            decorators_1.property()
        ], StreetView.prototype, "isActive", void 0);
        __decorate([
            decorators_1.property()
        ], StreetView.prototype, "viewer", void 0);
        __decorate([
            decorators_1.property()
        ], StreetView.prototype, "streetViewNode", void 0);
        StreetView = __decorate([
            decorators_1.subclass("layermark.widgets.StreetView")
        ], StreetView);
        return StreetView;
    }(decorators_1.declared(Widget)));
    return StreetView;
});
//# sourceMappingURL=StreetViewWidget.js.map