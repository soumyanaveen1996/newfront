import Reactotron, { trackGlobalErrors } from "reactotron-react-native";

Reactotron.configure() // controls connection & communication settings
  .useReactNative() // add all built-in react native plugins
  .use(trackGlobalErrors())
  .connect(); // let's connect!

Reactotron.clear();
console.tron = Reactotron;
