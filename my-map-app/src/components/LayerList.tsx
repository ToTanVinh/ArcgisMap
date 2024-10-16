import React from "react";

interface LayerListProps {
  map: __esri.Map | null; // Specify that map can be of type Map or null
}

const LayerList: React.FC<LayerListProps> = ({ map }) => {
  return (
    <div>
      <h4>Layers</h4>
      <ul>
        {map?.layers.map(
          (
            layer: __esri.Layer // Specify layer type
          ) => (
            <li key={layer.id}>{layer.title}</li>
          )
        )}
      </ul>
    </div>
  );
};

export default LayerList;
