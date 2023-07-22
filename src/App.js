import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import * as MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { useDispatch } from "react-redux";
import { fetchPostcodeData } from "./components/postcode/postcodeAction";
import climateData from "./data/climate.geojson";
function App() {
  const [maplayer, setMaplayer] = useState(0);
  const mapContainer = useRef(null);
  const map = useRef();
  const search = useRef();

  const toogleMaplayer = (state) => {
    setMaplayer(state);
    if (maplayer === 0) {
      map.current.setLayoutProperty("postcode", "visibility", "none");
      map.current.setLayoutProperty("climate", "visibility", "none");
    } else if (maplayer === 1) {
      map.current.setLayoutProperty("postcode", "visibility", "visible");
      map.current.setLayoutProperty("climate", "visibility", "none");
    } else if (maplayer === 2) {
      map.current.setLayoutProperty("postcode", "visibility", "none");
      map.current.setLayoutProperty("climate", "visibility", "visible");
    }
  };

  useEffect(() => {
    //Initialise map
    map.current = new mapboxgl.Map({
      //Map controls
      //Use data visualisation to style the map
      style: "mapbox://styles/frontzion/clkcajfcc000q01q2ei4a8wfk",
      //center the map to Australia
      center: [134.1511, -25.347],
      //Control the zoom
      zoom: 4,
      //Pith map for 3D effect
      pitch: 15,
      //Map container
      container: mapContainer.current,
      //Access Token MAPBOX
      accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
    });

    const geoCoderSearch = new MapboxGeocoder({
      accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
      mapboxgl: mapboxgl,
      //limit country only for australia
      countries: "au",
      container: search.current,
    });

    map.current.addControl(geoCoderSearch, "top-left");
    map.current.addControl(new mapboxgl.NavigationControl());
    map.current.addControl(new mapboxgl.GeolocateControl());
    map.current.addControl(new mapboxgl.FullscreenControl());
    map.current.addControl(new mapboxgl.ScaleControl());

    map.current.on("load", () => {
      map.current.addSource("climateFill", {
        type: "geojson",
        data: climateData,
      });

      map.current.addLayer({
        id: "climate-fills",
        type: "fill",
        source: "climateFill",
        layout: {},
        paint: {
          "fill-color": "#627BC1",
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.5,
            0.1,
          ],
        },
      });

      map.current.addLayer({
        id: "climate-borders",
        type: "line",
        source: "climateFill",
        layout: {},
        paint: {
          "line-color": "#627BC1",
          "line-width": 2,
        },
      });
    });
  }, []);

  useEffect(() => {
    let hoveredPolygonId = null;
    map.current.on("mousemove", "climate-fills", (e) => {
      if (e.features.length > 0) {
        if (hoveredPolygonId !== null) {
          map.current.setFeatureState(
            {
              source: "climateFill",
              id: hoveredPolygonId,
            },
            {
              hover: false,
            }
          );
        }
        hoveredPolygonId = e.features[0].id;
        console.log(hoveredPolygonId);
        map.current.setFeatureState(
          {
            source: "climateFill",
            id: hoveredPolygonId,
          },
          { hover: true }
        );
      }
    });

    map.current.on("mouseleave", "climate-fills", () => {
      if (hoveredPolygonId !== null) {
        map.current.setFeatureState(
          {
            source: "climateFill",
            id: hoveredPolygonId,
          },
          { hover: false }
        );
        hoveredPolygonId = null;
      }
    });
  }, []);

  return (
    <main className="relative overflow-hidden">
      <div className="h-screen w-screen flex flex-row items-center justify-center">
        <div className="h-[90vh] w-[90vw]  bg-slate-500" ref={mapContainer}>
          <div className="absolute right-0 top-[50%] z-10">
            <button
              className="w-20 bg-black rounded text-neutral-100"
              onClick={() => toogleMaplayer(2)}
            >
              Set map layer to 2
            </button>
            <button
              className="w-20 bg-black rounded text-neutral-100"
              onClick={() => toogleMaplayer(1)}
            >
              Set map layer to 1
            </button>
            <button
              className="w-20 bg-black rounded text-neutral-100"
              onClick={() => toogleMaplayer(0)}
            >
              Set map layer to 0
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
