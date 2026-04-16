import { NavigationContainer } from '@react-navigation/native';
import { MainStackNavigator } from './presentation/navigator/MainStackNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <MainStackNavigator />
    </NavigationContainer>
  );
}
