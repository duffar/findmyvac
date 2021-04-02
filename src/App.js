import React, { useEffect, useState } from "react";
import "./index.css";
import findProviders from "./vacFinder";
import geolocation from "geolocation";

function App() {
  const [inputs, setInputs] = useState({
    homeLat: 44.0121,
    homeLon: -92.4802,
    states: "MN, IA, WI, SD", // it'd be great to determine these from the coordinate and maxdistance but this is simple
    maxDistance: 150,
  });
  const [availProviders, setAvailProviders] = useState([]);
  const [providerDetails, setproviderDetails] = useState();

  async function findProvidersNow() {
    setproviderDetails("");
    setAvailProviders(await findProviders(inputs));
  }

  useEffect(() => {
    // console.log({ availProviders });
  }, [availProviders]);

  useEffect(() => {
    // console.log({ inputs });
  }, [inputs]);

  const handleInputChange = (event) => {
    setInputs((inputs) => ({
      ...inputs,
      [event.target.name]: event.target.value,
    }));
  };

  const selectProvider = (event) => {
    setproviderDetails(event.target.title);
  };

  function findMe() {
    console.log("getting current location");
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

  return (
    <div className="App">
      <h1>Covid-19 Vaccine Locator</h1>
      <h2>Enter your criteria</h2>
      <div className="Criteria">
        <div className="location">
          Location: <button onClick={findMe}>current</button>
          <div className="lat">
            Lat:{" "}
            <input
              type="text"
              name="homeLat"
              value={inputs.homeLat}
              onChange={handleInputChange}
            />
          </div>
          <div className="lat">
            Long:{" "}
            <input
              type="text"
              name="homeLon"
              value={inputs.homeLon}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="states">
          States to search:{" "}
          <input
            type="text"
            name="states"
            value={inputs.states}
            onChange={handleInputChange}
          />
        </div>
        <div className="maxDistance">
          Max distance:{" "}
          <input
            type="number"
            name="maxDistance"
            value={inputs.maxDistance}
            onChange={handleInputChange}
          />
        </div>
      </div>
      <div>
        <button onClick={findProvidersNow}>Find Providers</button>
      </div>
      <div className="ProviderList">
        <h2>Providers matching criteria</h2>
        {availProviders.length} Providers in range taking appointments:
        <ul>
          {availProviders.map((item, index) => {
            const p = item["properties"];
            const loc = item["geometry"]["coordinates"];
            return (
              <li key={index}>
                <a href={p["url"]} target="_blank">{`${Math.round(
                  item.distance
                )}m, ${p["provider"]}, ${p["city"]}, ${p["state"]}`}</a>
                <a
                  href={`https://www.google.com/maps/dir/${inputs.homeLat},+${inputs.homeLon}/${loc[1]},+${loc[0]}`}
                  target="blank"
                >
                  (Map)
                </a>
                <span
                  onClick={selectProvider}
                  title={JSON.stringify(item, " ", 2)}
                >
                  {" "}
                  (details)
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="ProviderDetails">
        <h2>Provider details</h2>
        {providerDetails ? <textarea value={providerDetails}></textarea> : ""}
      </div>
    </div>
  );
}

export default App;
