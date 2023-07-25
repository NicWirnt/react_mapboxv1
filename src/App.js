import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import * as MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import climateData from "./data/climate.geojson";

function App() {
  const [maplayer, setMaplayer] = useState(0);
  const [mapProperties, setMapProperties] = useState();
  const mapContainer = useRef(null);
  const map = useRef();
  const search = useRef();

  const climateDataFill = { type: "geojson", data: climateData };

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
      //mapbox://styles/frontzion/clkddr76n001801pmf9v3e5rf
      style: "mapbox://styles/frontzion/clkcajfcc000q01q2ei4a8wfk",
      //center the map to Australia
      center: [134.1511, -25.347],
      //Control the zoom
      zoom: 4,
      //Pith map for 3D effect
      pitch: 10,
      //Map container
      container: mapContainer.current,
      //Access Token MAPBOX
      accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
    });

    // Search Bar
    const geoCoderSearch = new MapboxGeocoder({
      accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
      mapboxgl: mapboxgl,
      //limit country only for australia
      countries: "au",
      container: search.current,
    });

    map.current.on("load", () => {
      // map.current.addSource("climateHover", {
      //   type: "geojson",
      //   data: climateData,
      // });

      map.current.addLayer({
        id: "climate-fills",
        type: "fill",
        source: climateDataFill,
        layout: {},
        paint: {
          "fill-color": "#627BC1",
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.5,
            0.2,
          ],
        },
      });

      map.current.addLayer({
        id: "climate-borders",
        type: "line",
        source: climateDataFill,
        layout: {},
        paint: {
          "line-color": "#627BC1",
          "line-width": 1,
        },
      });
    });

    //setting the layer to none
    map.current.on("load", () => {
      map.current.setLayoutProperty("postcode", "visibility", "none");
      map.current.setLayoutProperty("climate", "visibility", "none");
    });
    //Displaying Search Bar
    map.current.addControl(geoCoderSearch, "top-left");
    console.log(
      geoCoderSearch.on("results", (results) => {
        console.log(results);
      })
    );
    //Control on the right top screen
    map.current.addControl(new mapboxgl.NavigationControl());
    map.current.addControl(new mapboxgl.GeolocateControl());
    map.current.addControl(new mapboxgl.FullscreenControl());
    map.current.addControl(new mapboxgl.ScaleControl());

    //Load the map manually using GEOJSON and adding fill and border accordingly
  }, []);

  //UseEffect mouse hovering feature
  useEffect(() => {
    let hoveredPolygonId = null;

    map.current.on("mouseenter", "climate-fills", (e) => {
      map.current.getCanvas().style.cursor = "pointer";
    });

    map.current.on("mouseleave", "climate-fills", () => {
      map.current.getCanvas().style.cursor = "";
    });
    map.current.on("mousemove", "climate-fills", (e) => {
      if (e.features.length > 0) {
        if (hoveredPolygonId !== null) {
          map.current.setFeatureState(
            {
              source: "climate-fills",
              id: hoveredPolygonId,
            },
            {
              hover: false,
            }
          );
        }
        hoveredPolygonId = e.features[0].id;

        map.current.setFeatureState(
          {
            source: "climate-fills",
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
            source: "climate-fills",
            id: hoveredPolygonId,
          },
          { hover: false }
        );
        hoveredPolygonId = null;
      }
    });

    map.current.on("click", "climate-fills", (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();

      const properties = e.features[0].properties;
      setMapProperties(properties);

      const description = `<p>Climate information <a href="${mapProperties?.PDF}" target="_blank"> ${mapProperties?.PDF}</a> </p>`;
      new mapboxgl.Popup()
        .setLngLat(coordinates[0][0])
        .setHTML(description)
        .addTo(map.current);
    });

    //checking map properties
    map.current.on("style.load", () => {
      const styleSources = map.current.style;
      console.log(styleSources);
    });
  }, []);

  return (
    <main className="relative overflow-hidden">
      <div className="h-screen w-screen flex flex-row items-center justify-center">
        <div ref={mapContainer} className="h-[90vh] w-[90vw]  bg-slate-500 ">
          <div className="absolute right-2 top-[50%] z-10">
            <div className="flex flex-col gap-2">
              <button
                className="w-20 bg-black rounded text-neutral-100"
                onClick={() => toogleMaplayer(2)}
              >
                Climate Zones
              </button>
              <button
                className="w-20 bg-black rounded text-neutral-100"
                onClick={() => toogleMaplayer(1)}
              >
                Postcode
              </button>
              <button
                className="w-20 bg-black rounded text-neutral-100"
                onClick={() => toogleMaplayer(0)}
              >
                Default Layout
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
