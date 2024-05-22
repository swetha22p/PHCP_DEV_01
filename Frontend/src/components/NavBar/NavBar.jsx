/* import React, { createRef, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import './NavBar.scss';
import { toggle, changeTitle, updateLanguage } from "../../store/features/nav/navSlice"
import useTranslations from "../Translations/useTranslations";
const menuItems = [
    { name: "Home", icon: "https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/web/non-active/home.svg", iconActive: "https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/web/active/home.svg", path: "home" },
    { name: "Data", icon: "https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/web/non-active/data.svg", iconActive: "https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/web/active/data.svg", path: "data" },
    { name: "Groups", icon: "https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/web/non-active/groups.svg", iconActive: "https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/web/active/groups.svg", path: "groups" },
    { name: "Tools", icon: "https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/web/non-active/tools.svg", iconActive: "https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/web/active/tools.svg", path: "tools" },
    { name: "Sign Out", icon: "https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/web/non-active/signout.svg", iconActive: "https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/web/active/signout.svg", path: "login" },
];

const NavBar = (props) => {
    const [ index, setIndex ] = useState(0);
    const loaction = useLocation();
    const navRef = useRef([]);
    navRef.current = menuItems.map((item, idx) => navRef.current[idx]?? createRef());
    const isNavExp = useSelector(state => state.nav.isNavExp);
    const title = useSelector(state => state.nav.title);
    const dispatch = useDispatch();
    const language = useSelector(state => state.nav.language); // Get the selected language from Redux state
    const translations = useTranslations();

    // Define translations object
   

    const currentTranslations = translations[language];
    const handleLanguageChange = (selectedLanguage) => {
        // Dispatch the updateLanguage action with the selected language
        dispatch(updateLanguage(selectedLanguage));
    };

    const clickHandler = ({name}, idx) => {
        dispatch(changeTitle(name));
        setIndex(idx);
    }
    

    useEffect(()=>{
        let idx = menuItems.findIndex(item => item.name === title);
        setIndex(idx);
    }, [title]);

    useEffect(()=>{
        // console.log("location changed", location.pathname);
        navRef.current.forEach((item, idx) => {
            if(item.current.className.includes("active")){
                setIndex(idx);
                dispatch(changeTitle(menuItems[idx].name));
            }
        });
    }, [loaction, dispatch]);

    return (
        <div className={isNavExp?"nav-container":"nav-container vertical"}>
            <div className="nav-header">
                <div className="hamburger" onClick={()=>{
                        dispatch(toggle());
                    }}></div>
                <img className="hamburger-image" src="https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/web/non-active/hamburger.svg" alt="Hamburger" 
                    onClick={()=>{
                        dispatch(toggle());
                    }} />
                {isNavExp && <div className="title">{currentTranslations && currentTranslations["PHCP"]}</div>}
            </div>
            <div className="menu-list">
                {menuItems.map((item,idx) => (
                    <NavLink ref={navRef.current[idx]} to={item.path} key={idx.toString()} onClick={clickHandler.bind(this, item, idx)}>
                        <div className={index===idx?"menu-item active":"menu-item"}>
                            <img src={index===idx?item.iconActive:item.icon} alt={item.name} />
                            {currentTranslations && <div className="label">{currentTranslations[item.name]}</div>}
                        </div>
                    </NavLink>
                ))}
            </div>
            <div className="nav-footer">
                <div className="user">
                    <img src="https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/web/non-active/user.svg" alt="user" />
                    {isNavExp && <div className="label">{currentTranslations && currentTranslations["User Profile"]}</div>}
                </div>
                <div className={isNavExp?"actions":"actions vertical"}>
                    <div className="items languages">
                    <div className="label">{currentTranslations && currentTranslations.language}</div>
                        <table className="lang">
    {isNavExp && 
        <tbody>
            <tr>
                <td className="lang-item" onClick={() => handleLanguageChange("en")}>En</td>
                <td className="lang-item" onClick={() => handleLanguageChange("hi")}>Hi</td>
                <td className="lang-item" onClick={() => handleLanguageChange("te")}>Te</td>
            </tr>
        </tbody>
    }
    {!isNavExp && 
        <tbody>
            <tr>
                <td className="lang-item" onClick={() => handleLanguageChange("en")}>En</td>
            </tr>
            <tr>
                <td className="lang-item" onClick={() => handleLanguageChange("hi")}>Hi</td>
            </tr>
            <tr>
                <td className="lang-item" onClick={() => handleLanguageChange("te")}>Te</td>
            </tr>
        </tbody>
    }
</table>
                    </div>
                    <div className="items">
                    <div className="label">{currentTranslations && currentTranslations.privacy}</div>
                    </div>
                    <div className="items">
                    <div className="label">{currentTranslations && currentTranslations.terms}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NavBar; */

import React, { createRef, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import './NavBar.scss';
import { toggle, changeTitle, updateLanguage } from "../../store/features/nav/navSlice"
import useTranslations from "../Translations/useTranslations";

const menuItems = [
    { name: "Home", icon: "https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/web/non-active/home.svg", iconActive: "https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/web/active/home.svg", path: "home" },
    { name: "Data", icon: "https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/web/non-active/data.svg", iconActive: "https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/web/active/data.svg", path: "data" },
    { name: "Groups", icon: "https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/web/non-active/groups.svg", iconActive: "https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/web/active/groups.svg", path: "groups" },
    { name: "Tools", icon: "https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/web/non-active/tools.svg", iconActive: "https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/web/active/tools.svg", path: "tools" },
    { name: "Sign Out", icon: "https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/web/non-active/signout.svg", iconActive: "https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/web/active/signout.svg", path: "login" },
];

const NavBar = (props) => {
    const [index, setIndex] = useState(0);
    const location = useLocation();
    const navRef = useRef([]);
    navRef.current = menuItems.map((item, idx) => navRef.current[idx] ?? createRef());
    const isNavExp = useSelector(state => state.nav.isNavExp);
    const title = useSelector(state => state.nav.title);
    const dispatch = useDispatch();
    const language = useSelector(state => state.nav.language); // Get the selected language from Redux state
    const translations = useTranslations();

    // Define translations object

    const currentTranslations = translations[language];

    const handleLanguageChange = (selectedLanguage) => {
        // Dispatch the updateLanguage action with the selected language
        dispatch(updateLanguage(selectedLanguage));
    };

    const clickHandler = ({ name, path }, idx) => {
        if (path === "login") {
            // Clear localStorage when Sign Out is clicked
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_role');
        }
        dispatch(changeTitle(name));
        setIndex(idx);
    }

    useEffect(() => {
        let idx = menuItems.findIndex(item => item.name === title);
        setIndex(idx);
    }, [title]);

    useEffect(() => {
        // console.log("location changed", location.pathname);
        navRef.current.forEach((item, idx) => {
            if (item.current.className.includes("active")) {
                setIndex(idx);
                dispatch(changeTitle(menuItems[idx].name));
            }
        });
    }, [location, dispatch]);

    return (
        <div className={isNavExp ? "nav-container" : "nav-container vertical"}>
            <div className="nav-header">
                <div
                    className="hamburger"
                    onClick={() => {
                        dispatch(toggle());
                    }}
                ></div>
                <img
                    className="hamburger-image"
                    src="https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/web/non-active/hamburger.svg"
                    alt="Hamburger"
                    onClick={() => {
                        dispatch(toggle());
                    }}
                />
                {isNavExp && <div className="title">{currentTranslations && currentTranslations["PHCP"]}</div>}
            </div>
            <div className="menu-list">
                {menuItems.map((item, idx) => (
                    <NavLink ref={navRef.current[idx]} to={item.path} key={idx.toString()} onClick={() => clickHandler(item, idx)}>
                        <div className={index === idx ? "menu-item active" : "menu-item"}>
                            <img src={index === idx ? item.iconActive : item.icon} alt={item.name} />
                            {currentTranslations && <div className="label">{currentTranslations[item.name]}</div>}
                        </div>
                    </NavLink>
                ))}
            </div>
            <div className="nav-footer">
                <div className="user">
                    <img src="https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/web/non-active/user.svg" alt="user" />
                    {isNavExp && <div className="label">{currentTranslations && currentTranslations["User Profile"]}</div>}
                </div>
                <div className={isNavExp ? "actions" : "actions vertical"}>
                    <div className="items languages">
                        <div className="label">{currentTranslations && currentTranslations.language}</div>
                        <table className="lang">
                            {isNavExp &&
                                <tbody>
                                    <tr>
                                        <td className="lang-item" onClick={() => handleLanguageChange("en")}>En</td>
                                        <td className="lang-item" onClick={() => handleLanguageChange("hi")}>Hi</td>
                                        <td className="lang-item" onClick={() => handleLanguageChange("te")}>Te</td>
                                    </tr>
                                </tbody>
                            }
                            {!isNavExp &&
                                <tbody>
                                    <tr>
                                        <td className="lang-item" onClick={() => handleLanguageChange("en")}>En</td>
                                    </tr>
                                    <tr>
                                        <td className="lang-item" onClick={() => handleLanguageChange("hi")}>Hi</td>
                                    </tr>
                                    <tr>
                                        <td className="lang-item" onClick={() => handleLanguageChange("te")}>Te</td>
                                    </tr>
                                </tbody>
                            }
                        </table>
                    </div>
                    <div className="items">
                        <div className="label">{currentTranslations && currentTranslations.privacy}</div>
                    </div>
                    <div className="items">
                        <div className="label">{currentTranslations && currentTranslations.terms}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NavBar;
