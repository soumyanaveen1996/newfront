import "./shim";
import { AppRegistry } from "react-native";
import App from "./App";
// import "./ReactotronConfig";
require("./ReactotronConfig");

AppRegistry.registerComponent("frontm_mobile", () => App);
