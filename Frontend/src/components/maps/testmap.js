import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import pin from "../maps/maps.png";

const MapMarker = ({ point, name, location, icon }) => {
  return (
    <Marker position={point} icon={icon}>
      <Popup>
        <strong>{name}</strong>
        <br />
        Location: {location}
      </Popup>
    </Marker>
  );
};

function Map() {
  const [selectedState, setSelectedState] = useState("TS"); // Default selection: Telangana (TS)

  const telanganaSummitData = [
    {
      name: "Tech Summit 2024",
      location: "HICC (Hyderabad International Convention Centre), HITEC City",
      position: [17.445377, 78.346491],
    },
    {
      name: "Education Summit",
      location: "Jawaharlal Nehru Technological University Hyderabad (JNTUH), Kukatpally",
      position: [17.418365, 78.463243],
    },
    {
      name: "Healthcare Conference",
      location: "Hyderabad International Trade Expositions Limited (HITEX), Madhapur",
      position: [17.542645, 78.502334],
    },
    {
      name: "Business Expo",
      location: "Novotel Hyderabad Convention Centre, HITEC City",
      position: [17.456937, 78.550963],
    },
    {
      name: "Innovation Forum",
      location: "Indian School of Business (ISB), Gachibowli",
      position: [17.236798, 78.446033],
    },
  ];

  const andhraPradeshSummitData = [
    {
      name: "Technology Summit 2024",
      location: "Vijayawada Convention Centre, Vijayawada",
      position: [16.5062, 80.6480],
    },
    {
      name: "Education Conference",
      location: "Andhra University, Visakhapatnam",
      position: [17.6868, 83.2185],
    },
    {
      name: "Healthcare Forum",
      location: "Kurnool Medical College, Kurnool",
      position: [15.8281, 78.0373],
    },
    {
      name: "Business Expo",
      location: "Tirupati International Convention Centre, Tirupati",
      position: [13.6316, 79.4235],
    },
    {
      name: "Innovation Symposium", 
      location: "Nellore Institute of Technology, Nellore",
      position: [14.4426, 79.9865],
    },
  ];

  const handleStateChange = (event) => {
    setSelectedState(event.target.value);
  };

  const selectedSummitData =
    selectedState === "TS" ? telanganaSummitData : andhraPradeshSummitData;

  // Define custom icons for markers based on the selected state
  const markerIcon = L.icon({
    iconUrl: pin,
    iconSize: [38, 40],
    iconAnchor: [19, 40],
    popupAnchor: [0, -40],
  });

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <label htmlFor="stateSelect">Select State:</label>
        <select id="stateSelect" value={selectedState} onChange={handleStateChange}>
          <option value="TS">Telangana (TS)</option>
          <option value="AP">Andhra Pradesh (AP)</option>
        </select>
      </div>
      <MapContainer
        center={[17.385044, 78.486671]} // Default center: Hyderabad
        zoom={8}
        style={{ height: "70vh", width: "70%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {selectedSummitData.map((summit, index) => (
          <MapMarker
            key={index}
            point={summit.position}
            name={summit.name}
            location={summit.location}
            icon={markerIcon} // Use the same icon for all markers (can customize for different colors)
          />
        ))}
      </MapContainer>
    </div>
  );
}

export default Map;