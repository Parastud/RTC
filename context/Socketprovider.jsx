import { createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);
export const useSocket = () => {
  const context = useContext(SocketContext);
  return context;
}
export const SocketProvider = (props) => {

    const socket = useMemo(() => io("192.168.0.119:8000"), []);
  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};