import "./shim";
import React from "react";
import { MainRouter } from "./app/routes/";

export default class App extends React.Component {
  render() {
    // console.tron.log("Starting APPPP!!!!");
    return <MainRouter />;
  }
}
