import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import './Map.css';

const Map = () => {
  const [geoData, setGeoData] = useState(null);
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [hoveredRoadId, setHoveredRoadId] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null); // 'roadType' or 'wasteManagement'

  useEffect(() => {
    // Load the GeoJSON data
    fetch('/urbaniq/mirpur_60ft.geojson')
      .then(response => response.json())
      .then(data => setGeoData(data))
      .catch(error => console.error('Error loading GeoJSON:', error));
  }, []);

  // Enhanced style for the roads
  const getStyle = (feature) => {
    const baseStyle = {
      weight: 4,
      opacity: 0.9,
      fillOpacity: 0.2,
    };

    if (activeFilter === 'wasteManagement') {
      return {
        ...baseStyle,
        color: feature.properties.waste_management ? '#22c55e' : '#fecaca',
        fillColor: feature.properties.waste_management ? '#22c55e' : '#fecaca'
      };
    }

    if (activeFilter === 'roadType') {
      return {
        ...baseStyle,
        color: feature.properties.road_width.type === 'flexible' ? '#FFD700' : '#22c55e',
        fillColor: feature.properties.road_width.type === 'flexible' ? '#FFD700' : '#22c55e'
      };
    }

    // Default color for all roads
    return {
      ...baseStyle,
      color: '#2563eb',
      fillColor: '#2563eb'
    };
  };

  const handleFilterChange = (filterType) => {
    setActiveFilter(activeFilter === filterType ? null : filterType);
  };

  const handleToggleFilters = () => {
    if (showFilters) {
      // If we're hiding filters, also reset the active filter
      setActiveFilter(null);
    }
    setShowFilters(!showFilters);
  };

  const handleRoadClick = (feature) => {
    setSelectedRoad(feature);
  };

  const handleClosePanel = () => {
    setSelectedRoad(null);
  };

  const handleMouseOver = (feature, e) => {
    if (e && e.originalEvent) {
      setHoveredRoadId(feature.properties.id);
      setTooltipPosition({
        x: e.originalEvent.clientX,
        y: e.originalEvent.clientY
      });
    }
  };

  const handleMouseMove = (e) => {
    if (hoveredRoadId && e && e.clientX && e.clientY) {
      setTooltipPosition({
        x: e.clientX,
        y: e.clientY
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

  const renderRoadTypeLegend = () => {
    if (activeFilter !== 'roadType') return null;
    return (
      <div className="legend-content">
        <div className="legend-item">
          <div className="color-box" style={{ backgroundColor: '#22c55e' }}></div>
          <span>Rigid Roads</span>
        </div>
        <div className="legend-item">
          <div className="color-box" style={{ backgroundColor: '#FFD700' }}></div>
          <span>Flexible Roads</span>
        </div>
      </div>
    );
  };

  const renderWasteManagementLegend = () => {
    if (activeFilter !== 'wasteManagement') return null;
    return (
      <div className="legend-content">
        <div className="legend-item">
          <div className="color-box" style={{ backgroundColor: '#22c55e' }}></div>
          <span>Waste Management Available</span>
        </div>
        <div className="legend-item">
          <div className="color-box" style={{ backgroundColor: '#fecaca' }}></div>
          <span>No Waste Management</span>
        </div>
      </div>
    );
  };

  return (
    <div className="map-container" onMouseMove={handleMouseMove}>
      <div className="map-header">
        <button 
          className="filter-toggle"
          onClick={handleToggleFilters}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
        <h1>Digital Mapping of Dhaka City Roads</h1>
      </div>
      {showFilters && (
        <div className="filter-options">
          <div className="filter-group">
            <div className="filter-option">
              <label>
                <input
                  type="checkbox"
                  checked={activeFilter === 'roadType'}
                  onChange={() => handleFilterChange('roadType')}
                />
                Road Type
              </label>
              {renderRoadTypeLegend()}
            </div>
            <div className="filter-option">
              <label>
                <input
                  type="checkbox"
                  checked={activeFilter === 'wasteManagement'}
                  onChange={() => handleFilterChange('wasteManagement')}
                />
                Waste Management
              </label>
              {renderWasteManagementLegend()}
            </div>
          </div>
        </div>
      )}
      <MapContainer
        center={[23.79792849754905, 90.36397682625856]}
        zoom={18}
        style={{ height: '100vh', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          opacity={0.9}
        />
        {geoData && (
          <GeoJSON
            data={geoData}
            style={getStyle}
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