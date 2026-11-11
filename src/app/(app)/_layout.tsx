import { Stack } from 'expo-router';

import { useColor } from '@/animaciones/useColores';

export default function LayoutApp() {
  const papel = useColor('papel');
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: papel } }} />;
}
