import Tabulator from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator.min.css";
import React, { useEffect, useState } from "react";
import moment from "moment";

// globally assign moment so that tabulator can find it
window.moment = moment;

// used to uniquely identify Tabulator instances
let globalTableCnt = 1;

/** 
 * Wrap Tabulator in a React component
 * Callers provide all the normal Tabulator constructor properties plus an optional setTabulatorCallback that will get called
 * with a reference to the created Tabulator instance
 * 
 * Each instance of the tabulator gets a unique id
 */
export default function RTabulator(props) {
  const [table, setTable] = useState();
  const [tableCnt, setTableCnt] = useState();
  useEffect(() => {
    globalTableCnt += 1;
    setTableCnt(globalTableCnt);
    const { setTabulatorCB, ...tprops } = props;
    const tabulator = new Tabulator(`#rtabulator-${tableCnt}`, tprops);
    if (setTabulatorCB) {
      setTabulatorCB(tabulator);
    }
    setTable(tabulator);
  }, []);

  return <div id={`rtabulator-${tableCnt}`} />;
}
