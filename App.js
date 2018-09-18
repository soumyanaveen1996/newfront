import "./shim";
import React from "react";
import { MainRouter } from "./app/routes/";

export default class App extends React.Component {
  render() {
    return <MainRouter />;
  }
}
