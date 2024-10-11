import "./App.css";
import {
  ArcgisMap,
  ArcgisLegend,
  ArcgisExpand,
} from "@arcgis/map-components-react";
import { useState } from "react";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Point from "@arcgis/core/geometry/Point";
import Graphic from "@arcgis/core/Graphic";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import Polyline from "@arcgis/core/geometry/Polyline";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";
import PopupTemple from "@arcgis/core/PopupTemplate.js";
import FieldsContent from "@arcgis/core/popup/content/FieldsContent";
import FieldInfo from "@arcgis/core/popup/FieldInfo";
import FieldInfoformat from "@arcgis/core/popup/support/FieldInfoFormat";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import SizeVarible from "@arcgis/core/renderers/visualVariables/SizeVariable";
import SizeStop from "@arcgis/core/renderers/visualVariables/support/SizeStop";
import { FeatureCountCard } from "./components/FeatureCountCart";
import { ArcSlider } from "./components/ArcSlider";
import PopupTemplate from "@arcgis/core/PopupTemplate.js";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";

const simpleMarkerSymbol = new SimpleMarkerSymbol({ color: "green" });

const sizeVariable = new SizeVarible({
  field: "mag",
  stops: [
    new SizeStop({ value: 1, size: "4px" }),
    new SizeStop({ value: 10, size: "40px" }),
  ],
});

const simpleRender = new SimpleRenderer({
  symbol: simpleMarkerSymbol,
  visualVariables: [sizeVariable],
});

const typeFieldInfo = new FieldInfo({
  fieldName: "type",
  label: "Type",
});

const typeMagnitudeFieldInfo = new FieldInfo({
  fieldName: "mag",
  label: "Magnitude",
});

const timeFieldInFormat = new FieldInfoformat({
  dateFormat: "long-date-short-time",
});

const typeTimeFieldInfo = new FieldInfo({
  fieldName: "time",
  label: "Time",
  format: timeFieldInFormat,
});

const fieldsContent = new FieldsContent({
  fieldInfos: [typeFieldInfo, typeMagnitudeFieldInfo, typeTimeFieldInfo],
});
const template = new PopupTemple({
  title: "{type} - {mag}",
  content: [fieldsContent],
});
const url = "http://localhost:3001/earthquake";
const statesUrl = "http://localhost:3002/states";

const topEarthQuakeGeoJSONLayer = new GeoJSONLayer({
  url,
  popupTemplate: template,
  renderer: simpleRender,
  orderBy: [
    {
      field: "mag",
      order: "ascending",
    },
  ],
});

const bottomEarthQuakeGeoJSONLayer = new GeoJSONLayer({
  url,
  popupTemplate: template,
  renderer: simpleRender,
  orderBy: [
    {
      field: "mag",
      order: "descending",
    },
  ],
});

const geoJSONLayer = new GeoJSONLayer({
  id: "earthquakeGeoJSONLayer",
  url,
  popupTemplate: template,
  renderer: simpleRender,
});
const onThumbDragSlider = (event: __esri.SliderThumbDragEvent) => {
  const { value } = event;
  geoJSONLayer.definitionExpression = `mag >= ${value}`;
  geoJSONLayer.refresh();
};

const statesPopupTemplate = new PopupTemplate({
  title: "{STATE_NAME}",
  content: "Population (2000): {POP2000}",
});

const statesRenderer = new SimpleRenderer({
  symbol: new SimpleFillSymbol({
    color: [51, 51, 255, 0.3],
    outline: {
      color: [0, 0, 0],
      width: 1,
    },
  }),
});
const statesGeoJSONLayer = new GeoJSONLayer({
  url: statesUrl,
  popupTemplate: statesPopupTemplate,
  renderer: statesRenderer,
});
function App() {
  const [mapView, setMapView] = useState<__esri.MapView>();
  const [showEarthquakeLayer, setShowEarthquakeLayer] = useState(true);
  const [showStatesLayer, setShowStatesLayer] = useState(true);

  const handleEarthquakeCheckboxChange = () => {
    setShowEarthquakeLayer((prev) => {
      if (mapView) {
        if (prev) {
          mapView.map.remove(geoJSONLayer);
        } else {
          mapView.map.add(geoJSONLayer);
        }
      }
      return !prev;
    });
  };

  const handleStatesCheckboxChange = () => {
    setShowStatesLayer((prev) => {
      if (mapView) {
        if (prev) {
          mapView.map.remove(statesGeoJSONLayer);
        } else {
          mapView.map.add(statesGeoJSONLayer);
        }
      }
      return !prev;
    });
  };
  return (
    <>
      <div className="mapDiv">
        <ArcgisMap
          onArcgisViewReadyChange={(event) => {
            //count
            const { map, view }: { map: __esri.Map; view: __esri.MapView } =
              event.target;
            setMapView(view);
            // Thêm layer vào bản đồ nếu checkbox được chọn
            if (showEarthquakeLayer) {
              map.add(geoJSONLayer);
            }
            if (showStatesLayer) {
              map.add(statesGeoJSONLayer);
            }
          }}
        >
          <ArcgisExpand>
            <ArcgisLegend></ArcgisLegend>
          </ArcgisExpand>
        </ArcgisMap>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={showEarthquakeLayer}
            onChange={handleEarthquakeCheckboxChange}
          />
          Show Earthquake Layer
        </label>
        <label>
          <input
            type="checkbox"
            checked={showStatesLayer}
            onChange={handleStatesCheckboxChange}
          />
          Show States Layer
        </label>
      </div>
      {mapView && (
        <FeatureCountCard title="Earthquake" view={mapView}></FeatureCountCard>
      )}
      {mapView && <ArcSlider view={mapView} onThumbDrag={onThumbDragSlider} />}
    </>
  );
}
export default App;
