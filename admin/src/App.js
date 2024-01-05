import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";


import QuickProcess from "./pages/QuickProcessing/index";
import socket from "./service/socket.js";
import axios from 'axios';
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import "primereact/resources/primereact.css";
import "prismjs/themes/prism-coy.css";
import "./App.scss";
import "./assets/layout/layout.scss";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import SourceManage from "./pages/SourceManage";
import { useSelector } from "react-redux";
import { Toast } from "primereact/toast";
import NotificationSound from "./assets/sounds/notification.wav";
const App = () => {
  const [displayDialog, setDisplayDialog] = useState(false);
  const notification = useRef(null);
  const audioPlayer = useRef(null);

  function playAudio() {
    if (!audioPlayer.current.paused || audioPlayer.current.currentTime) {
      console.log('current playing sound')
    } else {
      audioPlayer.current.loop = true;
      audioPlayer.current.play();
      setTimeout(() => {
        audioPlayer.current.loop = false;
        // audioPlayer.current.stop();
        audioPlayer.current.pause()
        audioPlayer.current.currentTime = 0
      }, 6000);
    }
  }
  const queryStr = useSelector((state) => state.query.queryStr);
  useEffect(() => {
    if (queryStr) {
      setDisplayDialog(true);
    } else {
      setDisplayDialog(false);
    }
  }, [queryStr]);


  const [ids, setIds] = useState([]);
  useEffect(() => {
    const onNotification = (data) => {
      // console.log('notification', data);
      notification.current.show({ severity: "info", summary: "Có bài viết mới", detail: data.detail });
      if ('Notification' in window && Notification.permission === "granted") {
        new Notification("Có bài viết mới", { body: data.detail });
      }
      playAudio();
      setIds(data.contentIds);
    }
    socket.on("notification", onNotification);
    // notification.current.show({ sticky:true, severity: "info", summary: "Thông báo", detail: "Có bài viết mới" });
    // setIds(["1", "2"]);
    return () => {
      socket.off('notification', onNotification);
    }
  }, []);

  return (
    <div>
      <Toast
        ref={notification}
        onClick={() => {
          console.log(ids);
        }}
      />
      <audio ref={audioPlayer} src={NotificationSound} />
      <Router>
        <Switch>
          <PrivateRoute path="/" exact component={QuickProcess} />
          <PrivateRoute path="/du-lieu" exact component={SourceManage} />
          <Route path="/login" exact component={Login} />
        </Switch>
      </Router>
    </div>
  );
};

export default App;
