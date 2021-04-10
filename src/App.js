import React, {useState, useEffect, useRef} from "react";
import './App.css';
import { MapContainer, Marker, TileLayer, useMap, useMapEvent } from "react-leaflet";
import "tachyons";
import * as L from "leaflet";
import ISS from "./ISS.png";


export default function App() {

  const [coordinates, setCoordinates] = useState([8.82259, -2.8125]);
  const [trackingStatus, setTrackingStatus] = useState(true);

  const interval = useRef(null);

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

  const ISSPassTimes = (map, latlng) => {
    fetch(`http://localhost:3001/iss-pass?lat=${latlng.lat}&lon=${latlng.lng}`, {
      method: 'get',
      headers: {'Content-Type': 'application/json'},
    }) 
    .then(response => response.json())
    .then(data => {
      L.popup({
        className: "popup"
      })
      .setLatLng(latlng)
      .setContent(`<p><b>Next Pass at this location:</b> <br />Time: ${data.time}<br/> Duration: ${data.duration}</p>`)
      .openOn(map);
    })
  }

  useEffect(() => {
    if (trackingStatus) {
      // is true so we are running the app
      moveISS();
      interval.current = setInterval(moveISS, 10000);
    } else {
      // tracking is deactivated so we clear the interval
      clearInterval(interval.current);
    }
  }, [trackingStatus]);

  const Panning = () =>  {
    console.log("Panning");
    const map = useMap();
    map.panTo(coordinates);
    useMapEvent('click', ({latlng}) => {
      console.log("Clicked");
      ISSPassTimes(map, latlng);
    })
    return null;
  }

  const icon = L.icon({
    iconUrl: ISS,
    iconSize: [80, 80],
    shadowSize: [60, 60],
  });

  const handleClick = () => {
    setTrackingStatus(!trackingStatus);
  }

  const Button = ({onClick}) => {
    return (
      <a className="f6 grow no-underline br-pill ph3 pv2 mb2 dib white bg-light-purple pointer"
         onClick={onClick}
      >{trackingStatus ? "Disable Tracking" : "Enable Tracking"}</a>
    )
  }

  return (
    <div className="tc container" style={{display: "block"}}>
      {trackingStatus 
      ? <><h1> Tracking the ISS! </h1><br/><br/><h2>{`Latitude: ${coordinates[0]}, Longitude: ${coordinates[1]}`}</h2></>
      : <><h1>Tracking the ISS <span className="deactivated"> deactivated!</span></h1><br/><br/><h2><span id="invisible">p</span></h2></>}
        
        
      
      <Button onClick={handleClick}/>
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
        <Marker position={coordinates} icon={icon} title="ISS">

        </Marker>
      </MapContainer>
      
    </div>
  )
}

//copy code from robofriends card/cardlist
// const Data = ({ISSPassTimeData})=> {
//   ISSPassTimeData.map((arr)=> {

//   })

//   return (
//     <div>
//       <p>Duration: </p>
//       <p>Time: </p>

//     </div>

//   )

// }