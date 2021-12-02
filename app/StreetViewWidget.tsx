/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";

import Widget = require("esri/widgets/Widget");

import {renderable, tsx} from "esri/widgets/support/widget";
import MapView = __esri.MapView;


// @ts-ignore
import StreetSmartApi = require("https://streetsmart.cyclomedia.com/api/v19.18/StreetSmartApi.js");
import Color from "esri/Color";
import Point from "esri/geometry/Point";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import SimpleMarkerSymbol from "esri/symbols/SimpleMarkerSymbol";
import Graphic from "esri/Graphic";
import SimpleLineSymbol from "esri/symbols/SimpleLineSymbol";
import SimpleFillSymbol from "esri/symbols/SimpleFillSymbol";
import Polygon from "esri/geometry/Polygon";
import WatchHandle = __esri.WatchHandle;


@subclass("layermark.widgets.StreetView")
class StreetView extends declared(Widget) {

    @property()
    view: MapView;

    @property()
    isActive: boolean;

    @property()
    viewer: any;

    @property()
    streetViewNode: any;


    recordLayer: GraphicsLayer = new GraphicsLayer();
    viewLayer: GraphicsLayer = new GraphicsLayer({minScale: 10000});

    constructor(params?: any) {
        super();
        this.view = params.view;
        this.streetViewNode =params.streetViewNode

        this.initializeStreetView();
    }


    clickHandle: IHandle;
    viewpointWatchHandle: WatchHandle

    activate() {
        this.clickHandle = this.view.on("click", (evt) => {
            this.viewer.openByCoordinate([evt.mapPoint.longitude, evt.mapPoint.latitude], "EPSG:4326")
        })

        this.viewpointWatchHandle = this.view.watch("viewpoint", () => {
            this.updateGraphic();
        })
        this.view.map.add(this.recordLayer);
        this.view.map.add(this.viewLayer);

    }

    deactivate() {
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

    }


    initializeStreetView() {
        StreetSmartApi.init({
            targetElement: this.streetViewNode,
            username: "Durmus.Cesur@dcwater.com",
            password: "tsJd83Tw1",
            apiKey: "y3YVWPQVyHsZS78NO_wxuTkZebQ1WDwN6r4py7kJy7wN-X4xGXw1qfc9aTExa7Q",
            srs: "EPSG:4326",
            locale: "en-us",
            configurationUrl: "https://atlas.cyclomedia.com/configuration",
            addressSettings:
                {
                    locale: "en",
                    database: "Nokia"
                }
        }).then(
            () => {
                console.log("Api: init: success!");

                const viewerType = StreetSmartApi.ViewerType.PANORAMA
                StreetSmartApi.open("WE13AUFB",
                    {
                        viewerType,
                        srs: "EPSG:4326",
                    }).then(
                    (result: any) => {

                        if (result && result.length > 0) {
                            this.viewer = result[0]
                            this.viewer.on("VIEW_CHANGE", (details: any) => {
                                var recording = this.viewer.getRecording();
                                this.view.goTo([recording.xyz[0], recording.xyz[1]]);
                                this.updateGraphic();
                            });

                            this.viewer.on("RECORDING_CLICK", () => {
                                this.updateGraphic();
                            });

                            this.viewer.on("IMAGE_CHANGE", () => {
                                this.updateGraphic();
                            });
                            (window as any).panoramaViewer = this.viewer;
                        }
                    }
                ).catch(
                    (reason: any) => {
                        console.log("Failed to create component(s) through API: " + reason);
                    }
                );
            },
            (err: any) => {
                console.log("Api: init: failed. Error: ", err);
            }
        );

    }

    render() {
        return (
            <div bind={this} onclick={this._toggleStreetView}>
                <div class="esri-widget--button esri-widget esri-interactive" style={this.isActive? "background:lightskyblue;": ""} role="button" title="Street Viewer">
                    <span class="esri-icon-media"/>
                    <span class="esri-icon-font-fallback-text">Street Viewer</span>
                </div>
            </div>
        );
    }


    _toggleStreetView() {
        this.isActive = !this.isActive;

        if (this.isActive) {
            this.activate();
        }else{
            this.deactivate();
        }
    }


    updateGraphic() {
        if (this.viewer == null) {
            return
        }
        const recording = this.viewer.getRecording();
        if (!recording || !recording.xyz) {
            return;
        }

        const x = recording.xyz[0];
        const y = recording.xyz[1];

        if (!x || !y) {
            return;
        }

        this.recordLayer.removeAll();
        this.viewLayer.removeAll();
        const viewerColor = Color.fromArray(this.viewer.getViewerColor());
        const point = new Point({longitude: x, latitude: y});

        // Street Smart API returns orientation in degrees.
        let {yaw, hFov} = this.viewer.getOrientation();

        // we need to use it in radians.
        yaw = this.toRadians(yaw);
        hFov = this.toRadians(hFov);

        const factor = 70;
        const hhFov = hFov * 0.5;
        const leftFovX = Math.sin(yaw - hhFov) * factor;
        const leftFovY = -Math.cos(yaw - hhFov) * factor;
        const rightFovX = Math.sin(yaw + hhFov) * factor;
        const rightFovY = -Math.cos(yaw + hhFov) * factor;


        const screenPoint = this.view.toScreen(point);

        const mapPoint = this.view.toMap(screenPoint);
        const left = this.view.toMap({x: screenPoint.x + leftFovX, y: screenPoint.y + leftFovY});
        const right = this.view.toMap({x: screenPoint.x + rightFovX, y: screenPoint.y + rightFovY});


        const recordSymbol = new SimpleMarkerSymbol({
            style: 'circle',
            color: viewerColor,
            size: 11
        });

        const record = new Graphic({geometry: point, symbol: recordSymbol});
        this.recordLayer.add(record);

        //const outline = new SimpleLineSymbol();

        const symbol = new SimpleFillSymbol();
        const polygon = new Polygon({
            rings: [[[mapPoint.x, mapPoint.y], [left.x, left.y], [right.x, right.y], [mapPoint.x, mapPoint.y]]],
            spatialReference: this.view.spatialReference
        });
        const graphic = new Graphic({geometry: polygon, symbol});

        this.viewLayer.add(graphic);

    }

    toRadians(deg: any) {
        return deg * (Math.PI / 180.0);
    }
}

export = StreetView;