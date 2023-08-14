import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import * as MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import climateData from "./data/climate.geojson";
import { getPostcode } from "./helper/axios";
import DataCard from "./components/DataCard";

function App() {
  const [maplayer, setMaplayer] = useState(0);
  const [mapProperties, setMapProperties] = useState("");
  const [postcode, setPostcode] = useState("");
  const [climateInfo, setClimateInfo] = useState();
  const [climatezone, setClimatezone] = useState("");
  const mapContainer = useRef(null);
  const geoCoder = useRef();
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

  //make a popup display funciton
  const popup = (coordinates, description, climateData) => {
    new mapboxgl.Popup({
      closeOnMove: false,
    })
      .setLngLat(coordinates)
      .setHTML(description + " " + (climateData ? climateData : ""))
      .addTo(map.current);
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
    geoCoder.current = new MapboxGeocoder({
      accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
      mapboxgl: mapboxgl,
      //limit country only for australia
      countries: "au",
      //limit search country, region, postcode, district, place, locality, neighborhood, address, poi, poi.landmark
      // types: "postcode",
      flyTo: false,
      collapsed: true,
      container: search.current,
    });

    map.current.on("load", () => {
      // map.current.addSource("climateHover", {
      //   type: "geojson",
      //   data: climateData,
      // });

      //condition to prevent double layers
      if (
        !map.current.style._layers[
          `climate-fills-hover
        `
        ]
      ) {
        map.current.addLayer({
          id: "climate-fills-hover",
          type: "fill",
          source: climateDataFill,
          layout: {},
          paint: {
            "fill-color": "rgba(119, 248, 99, 0.9)",
            "fill-opacity": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              0.5,
              0,
            ],
          },
        });
      }

      // map.current.addLayer({
      //   id: "climate-borders",
      //   type: "line",
      //   source: climateDataFill,
      //   layout: {},
      //   paint: {
      //     "line-color": "#627BC1",
      //     "line-width": 1,
      //   },
      // });
    });

    //setting the layer to none
    map.current.on("load", () => {
      map.current.setLayoutProperty("postcode", "visibility", "none");
      map.current.setLayoutProperty("climate", "visibility", "none");
    });

    //Control on the right top screen
    map.current.addControl(new mapboxgl.NavigationControl());
    map.current.addControl(new mapboxgl.GeolocateControl());
    map.current.addControl(new mapboxgl.FullscreenControl());
    map.current.addControl(new mapboxgl.ScaleControl());

    //Load the map manually using GEOJSON and adding fill and border accordingly
  }, []);

  //geoCoder useEffect or search bar
  useEffect(() => {
    //Displaying Search Bar
    const searchBar = document.getElementById("search");
    if (!searchBar.hasChildNodes()) {
      searchBar.appendChild(geoCoder.current.onAdd(map.current));
    }

    geoCoder.current.on("result", async (e) => {
      const coordinates = e.result.geometry.coordinates;
      const description =
        e.result.place_name +
        ", please click on the map for more detailed information";
      setPostcode(e.result.text);
      // const postcodeWithoutzero = parseInt(e.result.text);
      const respond = await getPostcode(e.result.text);
      setClimateInfo(respond);
      console.log(e.result);
      console.log(respond);
      // let climate = null;
      for (let i = 0; i < respond.length; i++) {
        if (respond[i].climate_zone !== "") {
          // climate = respond[i].climate_zone;
          setClimatezone(respond[i].climate_zone);
          break;
        }
      }
      popup(coordinates, description, climatezone);
      // map.current.fitBounds([coordinates, coordinates], {
      //   maxZoom: 10,
      // });
    });
    geoCoder.current.on("clear", () => {
      setPostcode("");
    });
  }, [postcode]);

  //UseEffect mouse hovering feature
  useEffect(() => {
    let hoveredPolygonId = null;

    map.current.on("mouseenter", "climate-fills-hover", (e) => {
      map.current.getCanvas().style.cursor = "pointer";
    });

    map.current.on("mouseleave", "climate-fills-hover", () => {
      map.current.getCanvas().style.cursor = "default";
    });
    map.current.on("mousemove", "climate-fills-hover", (e) => {
      if (e.features.length > 0) {
        if (hoveredPolygonId !== null) {
          map.current.setFeatureState(
            {
              source: "climate-fills-hover",
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
            source: "climate-fills-hover",
            id: hoveredPolygonId,
          },
          { hover: true }
        );
      }
    });

    map.current.on("mouseleave", "climate-fills-hover", () => {
      if (hoveredPolygonId !== null) {
        map.current.setFeatureState(
          {
            source: "climate-fills-hover",
            id: hoveredPolygonId,
          },
          { hover: false }
        );
        hoveredPolygonId = null;
      }
    });

    map.current.on("click", "climate-fills-hover", (e) => {
      console.log(e.features);
      const coordinates = e.features[0]?.geometry.coordinates.slice();
      console.log(coordinates);
      setMapProperties(e.features[0].properties.PDF);

      const description = `
      <p>
       <a href="${e.features[0].properties.PDF}" target="_blank" style={{
        textDecoration: "underline",
      }} >Click here</a>
      for more information about the climate in this area
       </p>
      `;

      if (e.features[0].geometry.type === "Polygon") {
        popup(coordinates[0][0], description);
      } else {
        popup(coordinates[0][0][0], description);
      }

      // new mapboxgl.Popup({
      //   closeOnMove: true,
      // })
      //   .setLngLat(coordinates[0][0])
      //   .setHTML(description)
      //   .addTo(map.current);
    });

    //checking map properties
    map.current.on("style.load", () => {
      const styleSources = map.current;
      console.log(styleSources);
    });
  }, []);

  return (
    <main className="relative overflow-hidden">
      <div className="h-screen w-screen flex flex-row items-center justify-center">
        <div ref={mapContainer} className="h-[90vh] w-[90vw]  bg-slate-500 ">
          <div
            id="search-datacard"
            className="absolute left-4 top-4 z-10 mr-10"
          >
            <div id="search" className="z-20"></div>
            {postcode !== "" && (
              <DataCard climateInfo={climateInfo} climatezone={climatezone} />
            )}
          </div>

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
