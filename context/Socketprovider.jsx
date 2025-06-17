
import { createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";


const SocketContext = createContext(null);
export const useSocket = () => {
  const context = useContext(SocketContext);
  return context;
}
export const SocketProvider = ({children}) => {

    const socket = useMemo(() => io(`${process.env.EXPO_PUBLIC_API_URL}:${process.env.EXPO_PUBLIC_API_PORT}`), []);
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};