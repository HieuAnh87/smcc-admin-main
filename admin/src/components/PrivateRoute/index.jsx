import { Redirect, Route } from "react-router-dom";
import LayoutAdmin from "../Layout";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "../../store/userStore";

const PrivateRoute = ({ component: Component, ...rest }) => {
  const dispatch = useDispatch()
  // const { userState, getUser } = store;
  const isLogged = useSelector((state) => state.user.isLogged)
  const loading = useSelector((state) => state.user.loading)
  const token = useSelector((state) => state.user.token)
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const getAuth = async () => {
      if (!isLogged) {
        setIsLoading(true);
        dispatch(getUser(token))
        setTimeout(() => {
          setIsLoading(false);
        }, 1000)
      }
    };
    getAuth();
  }, []);
  return (
    <Route
      {...rest}
      render={(props) =>
        isLogged || isLoading || loading ? (
          <LayoutAdmin>
            <Component />
          </LayoutAdmin>
        ) : (
          // <div></div>
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default PrivateRoute;
