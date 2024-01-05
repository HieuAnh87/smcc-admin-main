import classNames from "classnames";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Toast } from "primereact/toast";
import React, { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, Router, useHistory, useLocation } from "react-router-dom";
import { getUser, login } from "../../store/userStore";


const Login = () => {
  const dispatch = useDispatch()
  const location = useLocation();
  const loading = useSelector((state) => state.user.loading);
  const history = useHistory();
  const isLogged = useSelector((state) => state?.user?.isLogged);
  const error = useSelector((state) => state?.user?.error);
  const user = useSelector((state) => state?.user)
  const toast = useRef(null)
  const token = useSelector((state) => state?.user?.token)
  const defaultValues = {
    email: "",
    password: "",
  };
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues });

  const onSubmit = async (newData, e) => {
    e.preventDefault();
    const res = await dispatch(login(newData));
    
    // reset();
  };
  const getFormErrorMessage = (name) => {
    return errors[name] && <small className="p-error">{errors[name].message}</small>;
  };
  useEffect(() => {
    if(user.isLogged) {
      if(location.pathname == "/login") {
        history.push({
          pathname: "/"
        })
      } else {
        history.push({
          pathname: location.pathname
        })
      }
    }
  }, [user])
  useEffect(() => {
    const getAuth = async () => {
      if (!isLogged) {
        dispatch(getUser(token))
      }
    };
    getAuth();
  }, []);
  useEffect(() => {
   if(error) {
    toast.current.show({ severity: "error", summary: error, detail: "Lỗi" });

   }
  }, [error]);
  // if (isLogged) {
  //   return <Redirect to="/" />;
  // }
  return (
    <div>
      <Toast ref={toast} />
      {!loading ? (
        <div className="bg-login flex justify-content-center align-items-center">
          <div className="bg-white lg:w-6 xl:w-3 h-30rem border-round">
            <h2 className="text-start mt-4 mx-6 border-bottom-3 inline-block pb-2">Login</h2>
            <form action="" className="p-fluid px-6 mt-5">
              <div className="field">
                <span>
                  <label htmlFor="email" className={classNames({ "p-error": errors.name })}>
                    Email
                  </label>
                  <Controller name="email" control={control} rules={{ required: "Yêu cầu nhập email." }} render={({ field, fieldState }) => <InputText id={field.name} {...field} autoFocus placeholder="Tên đăng nhập" className={classNames({ "p-invalid": fieldState.invalid })} />} />
                </span>
                {getFormErrorMessage("name")}
              </div>
              <div className="field">
                <span>
                  <label htmlFor="password" className={classNames({ "p-error": errors.name })}>
                    Mật khẩu
                  </label>
                  <Controller name="password" control={control} rules={{ required: "Yêu cầu nhập mật khẩu." }} render={({ field, fieldState }) => <Password id={field.name} feedback={false} {...field} className={classNames({ "p-invalid": fieldState.invalid })} placeholder="Password" />} />
                </span>
                {getFormErrorMessage("name")}
              </div>
              <div className="text-center">
                <Button type="submit" onClick={handleSubmit(onSubmit)} label={"Đăng nhập"} className="mt-2 inline-block w-auto" />
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default Login;
