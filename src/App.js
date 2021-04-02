/* eslint-disable react/jsx-no-target-blank */
import React, { useEffect, useState } from "react";
import "./index.css";
import findProviders from "./vacFinder";
// import findLocation from "./addrFinder";
import geolocation from "geolocation";

function App() {
  const [inputs, setInputs] = useState({
    // address: '',
    homeLat: 44.0121,
    homeLon: -92.4802,
    states: "MN,IA,WI,SD", // it'd be great to determine these from the coordinate and maxdistance but this is simple
    maxDistance: 150,
  });
  const [availProviders, setAvailProviders] = useState([]);
  const [providerDetails, setproviderDetails] = useState();

  async function findProvidersNow() {
    setproviderDetails("");
    setAvailProviders(await findProviders(inputs));
  }

  useEffect(() => {
    // findMe();
    // console.log({ availProviders });
  }, []);

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

  return (
    <div className="App">
      <h1>Covid-19 Vaccine Locator</h1>
      <div className="Criteria">
        <h2>Where to search</h2>
        <div className="location">
          Enter your geo location below or click to: <button onClick={findMe}>find me</button>
          {/* <div className="address">
            Address:{" "}
            <input
              type="text"
              name="address"
              value={inputs.address}
              onChange={handleInputChange}
            />
          </div> */}
          <div className="lat">
            Latitude:{" "}
            <input
              type="text"
              name="homeLat"
              value={inputs.homeLat}
              onChange={handleInputChange}
            />
          </div>
          <div className="lat">
            Longitude:{" "}
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
          Maximum distance:{" "}
          <input
            type="number"
            name="maxDistance"
            value={inputs.maxDistance}
            onChange={handleInputChange}
          /> miles.
        </div>
      </div>
      <div className="FindProviders">
        <button onClick={findProvidersNow}>Find Providers</button>
      </div>
      <div className="ProviderList">
        <h2>Nearby Providers</h2>
        {availProviders.length} Providers in range taking appointments:
        <ul>
          {availProviders.map((item, index) => {
            const p = item["properties"];
            const loc = item["geometry"]["coordinates"];
            const text = JSON.stringify(item,' ',2);
            return (
              <li key={index}>{Math.round(item.distance)}m, {p["provider"]}, {p["city"]}, {p["state"]+' '}
                <a href={p["url"]} target="_blank">(Schedule)</a>
                {' '}
                <a
                  href={`https://www.google.com/maps/dir/${inputs.homeLat},+${inputs.homeLon}/${loc[1]},+${loc[0]}`}
                  target="_blank"
                >
                  (Map)
                </a>
                {' '}
                <span title={text}>
                  <a onClick={selectProvider} href="#ProviderDetails" data-text={text}>
                    (details)
                  </a>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <div id="ProviderDetails" className="ProviderDetails">
        <h2>Provider details</h2>
        {providerDetails ? <textarea value={providerDetails} readOnly></textarea> : ""}
      </div>
      <footer>
        This website is based off data found at <a href="https://www.vaccinespotter.org/" target="_blank">vaccinespotter.org</a>. Many thanks for their generocity in providing the data. 
      </footer>
    </div>
  );
}

export default App;
