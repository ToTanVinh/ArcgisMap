import { useEffect, useState } from "react";
import Query from "@arcgis/core/rest/support/Query.js";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";

export const FeatureCountCard = (props: {
  title: string;
  view: __esri.MapView;
}) => {
  const { title, view } = props;
  const featureCountCardID = "featureCountCard";
  const [layerFeaturesCount, setLayerFeaturesCount] = useState<number | string>(
    "-"
  );
  const [layerFeaturesView, setLayerFeaturesView] = useState<number | string>(
    "-"
  );

  useEffect(() => {
    const peopleGeoJson = view.map.findLayerById(
      "earthquakeGeoJSONLayer"
    ) as __esri.GeoJSONLayer;

    const updateFeatureCount = async () => {
      if (peopleGeoJson) {
        const featureCount = await peopleGeoJson.queryFeatureCount();
        setLayerFeaturesCount(featureCount);
      } else {
        console.log("Layer not found!");
      }
    };

    //xu li dem layer view hien tia
    const updateFeatureView = async () => {
      if (peopleGeoJson) {
        const layerView = await view.whenLayerView(peopleGeoJson);

        reactiveUtils.watch(
          () => layerView.dataUpdating,
          async (dataUpdating) => {
            if (!dataUpdating) {
              const query = new Query({
                geometry: view.extent,
                spatialRelationship: "contains",
              });
              const viewFeatureCount = await layerView.queryFeatureCount(query);
              setLayerFeaturesView(viewFeatureCount);
            }
          }
        );
      }
    };

    peopleGeoJson.on("refresh", updateFeatureCount);

    view.ui.add(featureCountCardID, "bottom-right");
    updateFeatureCount();
    updateFeatureView();
  }, [view]);

  return (
    <div id={featureCountCardID} className="feature-count-card">
      <div className="title">{title}</div>
      <div className="item">
        <span className="label">LayerView features:</span>
        <span className="value">{layerFeaturesView}</span>
      </div>

      <div className="item">
        <span className="label">Layer features:</span>
        <span className="value">{layerFeaturesCount}</span>
      </div>
    </div>
  );
};
