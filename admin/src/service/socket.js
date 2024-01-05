import io from "socket.io-client";
// const socket = io(window.location.host.toString(), { path: '/ws' });
const socket = io(process.env.REACT_APP_WS_URL || window.location.host.toString(), {
  path: "/ws",
  auth: {
    token: localStorage.getItem("access_token"),
  },
});

socket.on("connect", () => {
  console.log(socket.id);
});

socket.on("disconnect", () => {
  console.log("socket disconnected");
});

socket.on("connect_error", (e) => {
  console.log("socket connect error: ", e);
});
export default socket;
