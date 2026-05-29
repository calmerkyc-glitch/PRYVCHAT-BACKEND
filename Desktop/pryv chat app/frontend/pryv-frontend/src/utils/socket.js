import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export const initSocket = () => {
  return io(SOCKET_URL, {
    transports: ["websocket"],
    autoConnect: true,
  });
};

export const disconnectSocket = (socket) => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};
