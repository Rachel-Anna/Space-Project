import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvent,
} from "react-leaflet";
import "tachyons";
import * as L from "leaflet";
import ISS from "./ISS.png";

export default function App() {
  const [coordinates, setCoordinates] = useState([8.82259, -2.8125]);
  const [tracking, setTrackingStatus] = useState(true);

  const interval = useRef(null);
  const initialised = useRef(false);

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
    if (tracking) {
      moveISS();
      interval.current = setInterval(moveISS, 10000);
    } else {
      clearInterval(interval.current);
    }
  }, [tracking]);

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
      console.log("Clicked");
      ISSPassTimes(map, latlng);
    });
    return null;
  };

  const icon = L.icon({
    iconUrl: ISS,
    iconSize: [50, 50],
  });

  const handleClick = () => {
    setTrackingStatus(!tracking);
  };

  const Button = ({ onClick, children }) => {
    return (
      <p
        className="f6 no-underline br-pill ph3 pv2 mb3 ma3 dib white bg-light-purple"
        onClick={onClick}
      >
        {children}
      </p>
    );
  };

  const DropdownButton = () => {
    return (
      <div className="dropdown">
        <Button onClick={handleTrackingSpeed}>{"Set tracking speed"}</Button>
        <div className="dropdown-content">
          <a href="#">Link 1</a>
          <a href="#">Link 2</a>
          <a href="#">Link 3</a>
        </div>
      </div>
    );
  };

  const handleTrackingSpeed = () => {
    console.log("clicked");

    return null;
  };

  return (
    <div className="tc container" style={{ display: "block" }}>
      <div id="title-container">
        {tracking ? (
          <>
            <h1> Tracking the ISS! </h1>
            <br />
            <br />
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
      <span>
        <Button onClick={handleClick}>
          {tracking ? "Disable Tracking" : "Enable Tracking"}
        </Button>
        <DropdownButton />
      </span>
    </div>
  );
}
