import "./global.css";
import { NavigationContainer } from '@react-navigation/native';
import StackNavigation from './src/navigation/StackNavigation';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { StatusBar } from 'react-native';

const logo = require('./assets/loopr-logo.png');


export default function App() {
  return (
    <>
      {/* Global StatusBar setting */}
      <StatusBar barStyle="light-content" backgroundColor="#27084e" />
    <ActionSheetProvider>
    <NavigationContainer>
      <StackNavigation />
    </NavigationContainer>
    </ActionSheetProvider>
  </>
  );
}
