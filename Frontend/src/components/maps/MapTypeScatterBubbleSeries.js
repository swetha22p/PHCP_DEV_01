import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { IgrGeographicMapModule } from 'igniteui-react-maps';
import { IgrGeographicMap } from 'igniteui-react-maps';
import { IgrGeographicProportionalSymbolSeries } from 'igniteui-react-maps';
import { IgrDataChartInteractivityModule } from 'igniteui-react-charts';
import { IgrValueBrushScale } from 'igniteui-react-charts';
import { IgrSizeScale } from 'igniteui-react-charts';
import { IgrDataContext } from 'igniteui-react-core';
import { MarkerType } from 'igniteui-react-charts';
import WorldLocations from "./WorldLocations";
import WorldUtils from "./WorldUtils";

IgrGeographicMapModule.register();
IgrDataChartInteractivityModule.register();

const MapTypeScatterBubbleSeries = () => {
    const geoMapRef = useRef(null);

    useEffect(() => {
        if (!geoMapRef.current) return;

        const geoMap = geoMapRef.current;
        geoMap.updateZoomWindow({ left: 0.2, top: 0.1, width: 0.6, height: 0.6 });

        const locations = WorldLocations.getAll();

        const sizeScale = new IgrSizeScale({});
        sizeScale.minimumValue = 4;
        sizeScale.maximumValue = 60;

        const brushes = [
            "rgba(14, 194, 14, 0.4)",  // semi-transparent green
            "rgba(252, 170, 32, 0.4)", // semi-transparent orange
            "rgba(252, 32, 32, 0.4)",  // semi-transparent red
        ];

        const brushScale = new IgrValueBrushScale({});
        brushScale.brushes = brushes;
        brushScale.minimumValue = 0;
        brushScale.maximumValue = 30;

        const symbolSeries = new IgrGeographicProportionalSymbolSeries({ name: "symbolSeries" });
        symbolSeries.dataSource = locations;
        symbolSeries.markerType = MarkerType.Circle;
        symbolSeries.radiusScale = sizeScale;
        symbolSeries.fillScale = brushScale;
        symbolSeries.fillMemberPath = "pop";
        symbolSeries.radiusMemberPath = "pop";
        symbolSeries.latitudeMemberPath = "lat";
        symbolSeries.longitudeMemberPath = "lon";
        symbolSeries.markerOutline = "rgba(0,0,0,0.3)";
        symbolSeries.tooltipTemplate = createTooltip;

        geoMap.series.add(symbolSeries);
    }, []);

    const createTooltip = (context) => {
        const dataContext = context.dataContext;
        if (!dataContext) return null;

        const dataItem = dataContext.item;
        if (!dataItem) return null;

        const pop = dataItem.pop.toFixed(1) + " M";
        const lat = WorldUtils.toStringLat(dataItem.lat);
        const lon = WorldUtils.toStringLon(dataItem.lon);

        return (
            <div>
                <div className="tooltipTitle">{dataItem.name}</div>
                <div className="tooltipBox">
                    <div className="tooltipRow">
                        <div className="tooltipLbl">Country:</div>
                        <div className="tooltipVal">{dataItem.country}</div>
                    </div>
                    <div className="tooltipRow">
                        <div className="tooltipLbl">Population:</div>
                        <div className="tooltipVal">{pop}</div>
                    </div>
                    <div className="tooltipRow">
                        <div className="tooltipLbl">Latitude:</div>
                        <div className="tooltipVal">{lat}</div>
                    </div>
                    <div className="tooltipRow">
                        <div className="tooltipLbl">Longitude:</div>
                        <div className="tooltipVal">{lon}</div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="container sample">
            <div className="container">
                <IgrGeographicMap
                    ref={geoMapRef}
                    width="100%"
                    height="100%"
                    zoomable={true} />
            </div>
            <div className="overlay-bottom-right overlay-border">Imagery Tiles: @OpenStreetMap</div>
        </div>
    );
}

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(<MapTypeScatterBubbleSeries />);
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(<MapTypeScatterBubbleSeries />);


export default MapTypeScatterBubbleSeries;
