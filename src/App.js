import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvent,
} from "react-leaflet";
import "tachyons";
import * as L from "leaflet";
import Button from "./components/Button";
import DropdownButton from "./components/DropdownButton";
import ISS from "./ISS.png";

const trackingIntervalOptions = [15, 30, 60];

export default function App() {
  const [coordinates, setCoordinates] = useState([8.82259, -2.8125]);
  const [trackingStatus, setTrackingStatus] = useState(true);
  const [trackingInterval, setTrackingInterval] = useState(15); // default 15 seconds
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const interval = useRef(null);
  const initialised = useRef(false);
  const previousInterval = useRef(0);

  const moveISS = () => {
    fetch("http://localhost:3001/iss-now", {
      method: "get",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        let lat = Number(data["iss_position"]["latitude"]);
        let lon = Number(data["iss_position"]["longitude"]);
        setCoordinates([lat, lon]);
      });
  };

  const ISSPassTimes = (map, latlng) => {
    fetch(
      `http://localhost:3001/iss-pass?lat=${latlng.lat}&lon=${latlng.lng}`,
      {
        method: "get",
        headers: { "Content-Type": "application/json" },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        let minutesText = data.duration > 1 ? "minutes" : "minute";
        L.popup({
          className: "popup",
        })
          .setLatLng(latlng)
          .setContent(
            `<p><b>Next pass around this location:</b> <br/><b>Time:</b> ${data.time} (${data.timeUntil})<br/><b>Duration:</b> ${data.duration} ${minutesText}</p>`
          )
          .openOn(map);
      });
  };

  useEffect(() => {
    if (trackingStatus) {
      if (previousInterval.current !== trackingInterval) {
        clearInterval(interval.current);
      }
      previousInterval.current = trackingInterval;
      moveISS();
      interval.current = setInterval(moveISS, parseInt(trackingInterval) * 1000); // setInterval requires ms
    } else {
      clearInterval(interval.current);
    }
  }, [trackingStatus, trackingInterval]);

  const Panning = () => {
    const map = useMap();
    if (initialised.current) {
      map.panTo(coordinates);
      L.circleMarker(coordinates, {
        color: "#3388ff",
      })
        .setRadius(5)
        .addTo(map);
    }
    if (!initialised.current) {
      initialised.current = true;
    }
    useMapEvent("click", ({ latlng }) => {
      ISSPassTimes(map, latlng);
    });
    return null;
  };

  const icon = L.icon({
    iconUrl: ISS,
    iconSize: [50, 50],
  });

  const handleClick = () => {
    setTrackingStatus(!trackingStatus);
  };

  const handleDropdownItemClick = (event) => {
    // set the interval in ms
    setDropdownOpen(false);
    setTrackingInterval(event.target.value);
  };

  return (
    <div className="tc container">
      <div id="title-container">
        {trackingStatus ? (
          <>
            <h1>Tracking the ISS every {trackingInterval}s!</h1>
            <br/>
            <br/>
            <h2>{`Latitude: ${coordinates[0]}, Longitude: ${coordinates[1]}`}</h2>
          </>
        ) : (
          <>
            <h1>
              Tracking the ISS{" "}
              <span className="deactivated"> deactivated!</span>
            </h1>
          </>
        )}
      </div>
      <span>
        <Button onClick={handleClick} styles="ma3">
          {trackingStatus ? "Disable Tracking" : "Enable Tracking"}
        </Button>
        <DropdownButton
          data={trackingIntervalOptions}
          handleDropdownItemClick={handleDropdownItemClick}
          setDropdownOpen={setDropdownOpen}
          dropdownOpen={dropdownOpen}/>
      </span>
      <MapContainer
        id="map-container"
        center={[8.82259, -2.8125]}
        zoom={3}
        scrollWheelZoom={false}
        preferCanvas={true}
      >
        <Panning />
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {initialised.current ? (
          <Marker position={coordinates} icon={icon} title="ISS"></Marker>
        ) : null}
      </MapContainer>
    </div>
  );
}
