import "./App.css";
import {
  ArcgisMap,
  ArcgisLegend,
  ArcgisExpand,
} from "@arcgis/map-components-react";
import { useEffect, useState } from "react";
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
import LayerList from "./components/LayerList";

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
  id: "topEarthquakeLayer",
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
  id: "bottomEarthquakeLayer",
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
  id: "statesGeoJSONLayer",
  url: statesUrl,
  popupTemplate: statesPopupTemplate,
  renderer: statesRenderer,
});
function App() {
  const [mapView, setMapView] = useState<__esri.MapView>();
  const [showEarthquakeLayer, setShowEarthquakeLayer] = useState(true);
  const [showStatesLayer, setShowStatesLayer] = useState(true);
  const graphicsLayer = new GraphicsLayer();
  mapView?.map.add(graphicsLayer);
  const [searchResults, setSearchResults] = useState<__esri.Graphic[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleToggleFullscreen = () => {
    const mapDiv = document.querySelector(".mapDiv") as HTMLElement; // Chỉ định kiểu cho mapDiv
    if (mapDiv) {
      // Kiểm tra xem mapDiv có khác null hay không
      if (!document.fullscreenElement) {
        mapDiv.requestFullscreen().catch((err) => {
          console.error(
            `Error attempting to enable full-screen mode: ${err.message}`
          );
        });
      } else {
        document.exitFullscreen();
      }
    } else {
      console.error("mapDiv is null"); // Xử lý trường hợp mapDiv không tồn tại
    }
  };

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

  useEffect(() => {
    if (mapView) {
      const handleMapClick = async (event: __esri.ViewClickEvent) => {
        const response = await mapView.hitTest(event);
        console.log("Clicked at:", event); // Log thông tin nhấp chuột

        if (response.results.length) {
          // Xử lý kết quả hitTest ở đây
          const graphicHit = response.results.find((result) => {
            return (
              (result as __esri.GraphicHit).graphic &&
              ((result as __esri.GraphicHit).graphic.layer.id ===
                "earthquakeGeoJSONLayer" ||
                (result as __esri.GraphicHit).graphic.layer.id ===
                  "statesGeoJSONLayer")
            );
          }) as __esri.GraphicHit;

          if (graphicHit) {
            const clickedGraphic = graphicHit.graphic;

            // Hiển thị tùy chọn cho người dùng
            const choice = window.confirm("Do you want to edit this feature?");

            if (choice) {
              // Chỉnh sửa thuộc tính của đối tượng
              const newAttributes = prompt(
                "Nhập các thuộc tính mới cho đối tượng:",
                JSON.stringify(clickedGraphic.attributes)
              );
              if (newAttributes) {
                clickedGraphic.attributes = JSON.parse(newAttributes);

                // Cập nhật đối tượng đồ họa trong lớp đồ họa
                const updatedGraphic = clickedGraphic.clone();
                updatedGraphic.attributes = JSON.parse(newAttributes);
                graphicsLayer.add(updatedGraphic); // Thêm đối tượng đã cập nhật vào lớp đồ họa
              }
            }
          }
        } else {
          // Thông báo khi không click vào layer nào
          alert("Bạn không click vào đối tượng nào!");
        }
      };

      mapView.on("click", handleMapClick); // Thiết lập listener cho sự kiện nhấp chuột

      return () => {};
    }
  }, [mapView]);

  const handleSearch = async () => {
    if (!searchQuery) return;

    // Sử dụng ArcGIS Geocoding API để tìm kiếm
    const response = await fetch(
      `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&address=${encodeURIComponent(
        searchQuery
      )}&outFields=Match_addr&maxLocations=5`
    );

    const data = await response.json();
    if (data.candidates && data.candidates.length) {
      const results = data.candidates.map((candidate: any) => {
        const point = {
          type: "point",
          longitude: candidate.location.x,
          latitude: candidate.location.y,
          spatialReference: { wkid: 4326 },
        };

        return new Graphic({
          geometry: point,
          attributes: {
            address: candidate.address,
          },
          // Use SimpleMarkerSymbol instead of a plain object
          symbol: new SimpleMarkerSymbol({
            color: "blue",
            size: "12px",
            outline: {
              color: "white",
              width: 1,
            },
          }),
        });
      });

      setSearchResults(results); // Cập nhật kết quả tìm kiếm
      if (mapView) {
        mapView.goTo(results[0].geometry); // Di chuyển bản đồ đến vị trí đầu tiên
      }
    } else {
      setSearchResults([]); // Không có kết quả tìm kiếm
    }
  };

  return (
    <>
      <div className="mapDiv">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm địa điểm..."
        />
        <button onClick={handleSearch}>Tìm kiếm</button>

        <ArcgisMap
          onArcgisViewReadyChange={(event) => {
            //count
            const { map, view }: { map: __esri.Map; view: __esri.MapView } =
              event.target;
            if (view) {
              setMapView(view);
              console.log("view created");
            } else {
              console.error("View is undefined");
            }

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
            {/* <LayerList map={mapView ? mapView.map : null} />{" "} */}
            {/* Add Layer List */}
            <ArcgisLegend
              layerInfos={[
                {
                  layer: geoJSONLayer,
                  title: "Earthquake Data",
                },
                {
                  layer: statesGeoJSONLayer,
                  title: "States Data",
                },
              ]}
            />
          </ArcgisExpand>
        </ArcgisMap>

        <div className="checkbox-container">
          <button onClick={handleToggleFullscreen}>
            {document.fullscreenElement
              ? "Exit Fullscreen"
              : "Enter Fullscreen"}
          </button>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showEarthquakeLayer}
              onChange={handleEarthquakeCheckboxChange}
            />
            Show Earthquake Layer
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showStatesLayer}
              onChange={handleStatesCheckboxChange}
            />
            Show States Layer
          </label>
        </div>
      </div>

      {mapView && (
        <FeatureCountCard title="Earthquake" view={mapView}></FeatureCountCard>
      )}
      {mapView && <ArcSlider view={mapView} onThumbDrag={onThumbDragSlider} />}
    </>
  );
}
export default App;
