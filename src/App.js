import React, {useState, useEffect} from "react";
import './App.css';
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "tachyons";


export default function App() {

  const [coordinates, setCoordinates] = useState([8.82259, -2.8125]);

  const moveISS = () => {
    fetch('http://localhost:3001/iss-now', {
      method: 'get',
      headers: {'Content-Type': 'application/json'},
    }) 
    .then(response => response.json())
    .then(data => {
      let lat = Number(data['iss_position']['latitude']);
      let lon = Number(data['iss_position']['longitude']);
      setCoordinates([lat, lon]);
    })
  }

  useEffect(() => { 
    setInterval(moveISS, 10000);
  }, []);

  function Panning() {
    const map = useMap();
    map.panTo(coordinates);
    return null;
  }

  return (
    <div className="tc container"
     style={{display: "block"}}>
    <h1>Tracking the ISS!<br/>{coordinates[0]}, {coordinates[1]}</h1>
    <MapContainer 
    id="map-container" 
    center={[8.82259, -2.8125]}
    zoom={2} 
    scrollWheelZoom={false}>
      <Panning/>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={coordinates}>
        <Popup>
          ISS
        </Popup>
      </Marker>
    </MapContainer>
    </div>
  )
}
