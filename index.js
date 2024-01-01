import { registerRootComponent } from 'expo';

import App from './App';
import {GoogleSignin} from "@react-native-google-signin/google-signin";
import {webClientId} from "./firebase/secrets";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
GoogleSignin.configure(
    {
        webClientId: webClientId,
        offlineAccess: true,
    }
)
registerRootComponent(App);
