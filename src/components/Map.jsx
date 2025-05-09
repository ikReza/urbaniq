import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import './Map.css';

const Map = () => {
  const [geoData, setGeoData] = useState(null);
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [hoveredRoadId, setHoveredRoadId] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Load the GeoJSON data
    fetch('/mirpur_60ft.geojson')
      .then(response => response.json())
      .then(data => setGeoData(data))
      .catch(error => console.error('Error loading GeoJSON:', error));
  }, []);

  // Enhanced style for the roads
  const style = {
    color: '#2563eb', // Brighter blue
    weight: 4,        // Thicker lines
    opacity: 0.9,     // More opaque
    fillOpacity: 0.2, // Slight fill
    fillColor: '#2563eb' // Fill color
  };

  const handleRoadClick = (feature) => {
    setSelectedRoad(feature);
  };

  const handleClosePanel = () => {
    setSelectedRoad(null);
  };

  const handleMouseOver = (feature, e) => {
    setHoveredRoadId(feature.properties.id);
    setTooltipPosition({
      x: e.originalEvent.clientX,
      y: e.originalEvent.clientY
    });
  };

  const handleMouseMove = (e) => {
    if (hoveredRoadId) {
      setTooltipPosition({
        x: e.originalEvent.clientX,
        y: e.originalEvent.clientY
      });
    }
  };

  const handleMouseOut = () => {
    setHoveredRoadId(null);
  };

  const renderRoadDetails = () => {
    if (!selectedRoad) return null;

    const { properties } = selectedRoad;
    const {
      road_width,
      footpath_width,
      street_lights,
      drainage,
      street_vendor,
      vendor_active_time,
      waste_management,
      floating_population
    } = properties;

    return (
      <div className="road-details-panel">
        <button className="close-button" onClick={handleClosePanel}>×</button>
        <h2>Road Details</h2>
        <div className="road-info">
          <div className="info-group">
            <h4>Road ID</h4>
            <p>{properties.id}</p>
          </div>
          <div className="info-group">
            <h4>Road Specifications</h4>
            <p>Actual: {road_width.actual}m</p>
            <p>Effective: {road_width.effective}m</p>
            <p>Type: {road_width.type}</p>
          </div>

          <div className="info-group">
            <h4>Footpath</h4>
            {footpath_width === "none" ? (
              <p>No footpath</p>
            ) : (
              <>
                <p>Actual: {footpath_width.actual}m</p>
                <p>Effective: {footpath_width.effective}m</p>
              </>
            )}
          </div>

          <div className="info-group">
            <h4>Street Lights</h4>
            {street_lights === "none" ? (
              <p>No street lights</p>
            ) : (
              <>
                <p>Total: {street_lights.actual}</p>
                <p>Functional: {street_lights.functional}</p>
              </>
            )}
          </div>

          <div className="info-group">
            <h4>Drainage</h4>
            <p>Present: {drainage.present ? 'Yes' : 'No'}</p>
            {drainage.present && <p>Type: {drainage.type}</p>}
          </div>

          <div className="info-group">
            <h4>Street Vendors</h4>
            <p>Count: {street_vendor}</p>
            {vendor_active_time && <p>Active Hours: {vendor_active_time}</p>}
          </div>

          <div className="info-group">
            <h4>Other Information</h4>
            <p>Waste Management: {waste_management ? 'Yes' : 'No'}</p>
            <p>Floating Population: {floating_population ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="map-container" onMouseMove={handleMouseMove}>
      <MapContainer
        center={[23.798398, 90.363195]} // Center on Mirpur
        zoom={15}
        style={{ height: '100vh', width: '100%' }}
      >
        {/* Minimal map style with reduced opacity */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          opacity={0.9} // Make the base map more transparent
        />
        {geoData && (
          <GeoJSON
            data={geoData}
            style={style}
            onEachFeature={(feature, layer) => {
              layer.on({
                click: () => handleRoadClick(feature),
                mouseover: (e) => handleMouseOver(feature, e),
                mouseout: handleMouseOut
              });
            }}
          />
        )}
        {hoveredRoadId && (
          <div 
            className="road-id-tooltip"
            style={{
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y + 10
            }}
          >
            Road ID: {hoveredRoadId}
          </div>
        )}
      </MapContainer>
      {renderRoadDetails()}
    </div>
  );
};

export default Map; 