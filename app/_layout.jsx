import { Stack } from "expo-router";
import { SocketProvider } from "../context/Socketprovider";
import "../global.css";
export default function RootLayout() {
  return <SocketProvider>
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: true,title:"Parastud Rooms",  headerTintColor: "white",  headerTitleAlign: "center", headerStyle: { backgroundColor:"#1d2429" }}} />
    </Stack>
  </SocketProvider>;
}
