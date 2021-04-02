
async function getData(address) {
    const resp = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=641c51bed8ab490184632ad8526e29ad&no_annotations=1&language=en
      `,
      {
        headers: {
        },
        // mode: 'no-cors',
        // referrerPolicy: 'origin'
      }
    );
  
    if (resp.status === 200) {
      const jresp = await resp.json();
      return jresp;
    }
  }
  
  export default async function findLocation(address) {
        console.log("getting current location", address);
      let results = null;
      if (address && address.length>0) {
        const data = await getData(address);
        console.log({data});
        results = data["results"]["geometry"];
      }
      return results;
  }
  
