export function distance(lat1, lon1, lat2, lon2, unit) {
  var radlat1 = (Math.PI * lat1) / 180;
  var radlat2 = (Math.PI * lat2) / 180;
  // var radlon1 = (Math.PI * lon1) / 180;
  // var radlon2 = (Math.PI * lon2) / 180;
  var theta = lon1 - lon2;
  var radtheta = (Math.PI * theta) / 180;
  var dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  if (unit === "K") {
    dist = dist * 1.609344;
  }
  if (unit === "N") {
    dist = dist * 0.8684;
  }
  return dist;
}

async function getData(state) {
  const resp = await fetch(
    `https://www.vaccinespotter.org/api/v0/states/${state}.json`,
    {
      headers: {},
    }
  );

  if (resp.status === 200) {
    const jresp = await resp.json();
    return jresp["features"];
  }
}

export default async function findProviders({
  homeLat,
  homeLon,
  maxDistance,
  states,
}) {
  console.log(
    `Finding providers within ${maxDistance} miles of [${homeLat}, ${homeLon}] in ${states}`
  );
  const statesList = states.split(",");
  let fdata = [];
  await Promise.all(
    statesList.map(async (state) => {
      const sdata = await getData(state.trim());
      const availableNearby = sdata.filter((item) => {
        const loc = item["geometry"]["coordinates"];
        let nearby = false;
        if (item["properties"]["appointments_available"]) {
          item.distance = distance(loc[1], loc[0], homeLat, homeLon);
          nearby = item.distance <= maxDistance;
        }
        return nearby;
      });
      fdata.push(...availableNearby);
    })
  );
  return fdata.sort((a, b) => a.distance - b.distance);
}
