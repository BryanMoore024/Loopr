import "./global.css";
import { NavigationContainer } from '@react-navigation/native';
import StackNavigation from './src/navigation/StackNavigation';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

const logo = require('./assets/loopr-logo.png');


export default function App() {
  return (
    <ActionSheetProvider>
    <NavigationContainer>
      <StackNavigation />
    </NavigationContainer>
    </ActionSheetProvider>
  );
}
