import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import logoImage from "../src/assets/images/smart.png"; // Thay đổi đường dẫn tương ứng với cấu trúc thư mục của dự án

export const AppTopbar = (props) => {
  return (
    <div className="layout-topbar">
      <Link to="/" className="layout-topbar-logo">
      <img src={logoImage} alt="App Logo" />
        <span>SmartTravel</span>
      </Link>

      <button type="button" className="p-link  layout-menu-button layout-topbar-button" onClick={props.onToggleMenuClick}>
        <i className="pi pi-bars" />
      </button>

      <button type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={props.onMobileTopbarMenuClick}>
        <i className="pi pi-ellipsis-v" />
      </button>

      <ul className={classNames("layout-topbar-menu lg:flex origin-top", { "layout-topbar-menu-mobile-active": props.mobileTopbarMenuActive })}>
        <li>
        <button className="p-link layout-topbar-button">
            <i className="pi pi-exclamation-triangle" style={{color: 'red'}} onClick={props.onPopupNotice}/>
            <span>Notification</span>
          </button>
          <button className="p-link layout-topbar-button" onClick={props.onPopupUserLogout}>
            <i className="pi pi-user" />
            <span>User</span>
          </button>
        </li>
        {/* <li>
          <button className="p-link layout-topbar-button" onClick={props.onMobileSubTopbarMenuClick}>
            <i className="pi pi-cog" />
            <span>Settings</span>
          </button>
        </li> */}
      </ul>
    </div>
  );
};
