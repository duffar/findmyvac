/* eslint-disable react/jsx-no-target-blank */
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import findProviders from "./vacFinder";
// import findLocation from "./addrFinder";
import geolocation from "geolocation";
import RTabulator from "./components/RTabulator";

function App() {
  const [inputs, setInputs] = useState({
    // address: '',
    homeLat: 44.0121,
    homeLon: -92.4802,
    states: "MN,IA,WI,SD", // it'd be great to determine these from the coordinate and maxdistance but this is simple
    maxDistance: 150,
    requireAppointments: true,
  });
  const [availProviders, setAvailProviders] = useState([]);
  const [visibleProviders, setVisibleProviders] = useState([]);
  const [providerDetails, setproviderDetails] = useState();
  const [tabulator, setTabulator] = useState();

  async function findProvidersNow() {
    setproviderDetails("");
    setAvailProviders(await findProviders(inputs));
  }

  useEffect(() => {
    tabulator && tabulator.replaceData(visibleProviders);
  }, [tabulator, visibleProviders]);

  useEffect(() => {
    setVisibleProviders(
      availProviders.filter(
        (item) =>
          item["properties"]["appointments_available"] ||
          !inputs.requireAppointments
      )
    );
  }, [availProviders, inputs]);

  useEffect(() => {
    // console.log({ inputs });
  }, [inputs]);

  const handleInputChange = (event) => {
    console.log({ event });
    if (event.target.type === "checkbox") {
      setInputs((inputs) => ({
        ...inputs,
        [event.target.name]: !inputs[event.target.name],
      }));
    } else {
      setInputs((inputs) => ({
        ...inputs,
        [event.target.name]: event.target.value,
      }));
    }
  };

  const selectProvider = (event) => {
    setproviderDetails(event.target.dataset.text);
  };

  function findMe() {
    // const addrLoc = findLocation(inputs.address);
    // console.log({addrLoc});
    // return;
    geolocation.getCurrentPosition(function (err, position) {
      console.log({ err, position });
      if (err) {
        alert(
          "Unable to access your current location. Enter lat/long manually."
        );
        return;
      }
      setInputs((inputs) => ({
        ...inputs,
        homeLat: position.coords.latitude,
        homeLon: position.coords.longitude,
      }));
    });
  }

  function vaccineList(p) {
    const list = [];
    const vacTypes = p["appointment_vaccine_types"];
    if (vacTypes) {
      Object.keys(vacTypes).forEach(function (key) {
        if (!!vacTypes[key]) {
          list.push(key);
        } else {
          list.push("?");
        }
      });
    }
    return list;
  }

  /** RTabulator callback to save the tabulator instance */
  function setTabulatorCB(t) {
    setTabulator(t);
  }

  /** Tabulator columns & formatting */
  const columns = [
    {
      title: "distance",
      field: "distance",
      sorter: "number",
      width: 75,
      formatter: "money",
      formatterParams: {
        thousand: ",",
        symbol: "m",
        symbolAfter: true,
        precision: 0,
      },
    },
    { title: "provider", field: "properties.provider", width: 100 },
    { title: "city", field: "properties.city", width: 100 },
    { title: "state", field: "properties.state", width: 50 },
    {
      title: "openings",
      field: "properties.appointments",
      width: 80,
      formatter: (cell, formatterParams, onRendered) => {
        onRendered(function () {
          ReactDOM.render(cell.getValue().length || "?", cell.getElement());
        });
      },
    },
    {
      title: "types",
      field: "properties",
      width: 120,
      formatter: (cell, formatterParams, onRendered) => {
        onRendered(function () {
          ReactDOM.render(vaccineList(cell.getValue()), cell.getElement());
        });
      },
    },
    {
      title: "url",
      field: "properties.url",
      width: 100,
      formatter: (cell, formatterParams, onRendered) => {
        const link = (
          <a href={cell.getValue()} target="_blank">
            (Schedule)
          </a>
        );
        onRendered(function () {
          ReactDOM.render(link, cell.getElement());
        });
      },
    },
    {
      title: "map",
      field: "geometry.coordinates",
      width: 50,
      formatter: (cell, formatterParams, onRendered) => {
        const loc = cell.getValue();
        const link = (
          <a
            href={`https://www.google.com/maps/dir/${inputs.homeLat},+${inputs.homeLon}/${loc[1]},+${loc[0]}`}
            target="_blank"
          >
            (Map)
          </a>
        );
        onRendered(function () {
          ReactDOM.render(link, cell.getElement());
        });
      },
    },
    {
      title: "details",
      field: "properties.address",
      width: 100,
      formatter: (cell, formatterParams, onRendered) => {
        const text = JSON.stringify(cell.getData(), " ", 2);
        // const text = JSON.stringify(cell.getValue(),' ',2);
        const link = (
          <span title={text}>
            <a
              onClick={selectProvider}
              href="#ProviderDetails"
              data-text={text}
            >
              (details)
            </a>
          </span>
        );
        onRendered(function () {
          ReactDOM.render(link, cell.getElement());
        });
      },
    },
  ];

  /** Tabulator row click handler */
  const rowClick = (e, row) => {
    console.log(`rowClick`, row, e);
    const rowData = row._row.data || null;
    if (rowData) {
    }
  };

  /** Tabulator table options */
  const options = {
    setTabulatorCB, // Optional prop introduced by RTabulator to save tabulator instance
    columns,
    initialSort: [
      { column: "distance", dir: "asc" }, //sort by this first
    ],
    headerSort: false,
    dataTree: false,
    placeholder: "No providers available",
    maxHeight: 400,
    layout: "fitDataFill",
    rowClick,
    selectable: 1,
    rowContextMenu: [],
    persistentLayout: true,
    persistentSort: true,
    persistenceID: "commentPerststance",
  };

  return (
    <div className="App">
      <h1>Covid-19 Vaccine Locator</h1>
      <div className="Criteria">
        <h2>Where to Search</h2>
        <div className="States">
          Initials of nearby states:{" "}
          <input
            type="text"
            name="states"
            value={inputs.states}
            onChange={handleInputChange}
          />
        </div>
        <div className="MaxDistance">
          Maximum distance away:{" "}
          <input
            type="number"
            name="maxDistance"
            value={inputs.maxDistance}
            onChange={handleInputChange}
          />{" "}
          miles.
        </div>
        <div className="Location">
          Enter your geo location below or click{" "}
          <button onClick={findMe}>find me</button>
          {/* <div className="address">
            Address:{" "}
            <input
              type="text"
              name="address"
              value={inputs.address}
              onChange={handleInputChange}
            />
          </div> */}
          <div className="Lat">
            Latitude:{" "}
            <input
              type="text"
              name="homeLat"
              value={inputs.homeLat}
              onChange={handleInputChange}
            />
          </div>
          <div className="Lon">
            Longitude:{" "}
            <input
              type="text"
              name="homeLon"
              value={inputs.homeLon}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <input
          type="checkbox"
          id="requireAppointments"
          name="requireAppointments"
          value={true}
          checked={inputs.requireAppointments}
          onChange={handleInputChange}
        />
        <label for="requireAppointments">
          {" "}
          Only show providers currently advertising appointments
        </label>
        <br></br>
      </div>
      <div className="FindProviders">
        <button onClick={findProvidersNow}>Find Providers</button>
      </div>
      <div className="ProviderList">
        <span>
          <h2>Nearby Providers</h2>
        </span>
        Showing {visibleProviders.length} of the {availProviders.length}{" "}
        providers in your area.
        <RTabulator {...options} />
      </div>
      <div id="ProviderDetails" className="ProviderDetails">
        <h2>Provider details</h2>
        {providerDetails ? (
          <textarea value={providerDetails} readOnly></textarea>
        ) : (
          ""
        )}
      </div>
      <footer>
        This website is based off data found at{" "}
        <a href="https://www.vaccinespotter.org/" target="_blank">
          vaccinespotter.org
        </a>
        . Many thanks for their generocity in providing the data.
      </footer>
    </div>
  );
}

export default App;
