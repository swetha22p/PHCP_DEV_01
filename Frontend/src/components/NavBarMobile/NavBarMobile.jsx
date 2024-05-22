import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { changeTitle } from "../../store/features/nav/navSlice";
import "./NavBarMobile.scss";

const menuItems = [
    { name: "Home", icon: "https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/mobile/non-active/home.svg", iconActive: "https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/mobile/active/home.svg", path: "home" },
    { name: "Data", icon: "https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/mobile/non-active/data.svg", iconActive: "https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/mobile/active/data.svg", path: "data" },
    { name: "Groups", icon: "https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/mobile/non-active/groups.svg", iconActive: "https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/mobile/active/groups.svg", path: "groups" },
    { name: "Tools", icon: "https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/mobile/non-active/tools.svg", iconActive: "https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/mobile/active/tools.svg", path: "tools" },
    { name: "Sign Out", icon: "https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/web/non-active/signout.svg", iconActive: "https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/web/active/signout.svg", action: function() {
        try {
            // Clear localStorage before navigating to login
            localStorage.clear();
          
        } catch (error) {
            console.error("An error occurred while clearing localStorage:", error);
        }
    },path: "login" },
];


const NavBarMobile = () => {
    const dispatch = useDispatch();
    const [ index, setIndex ] = useState(0);
    const title = useSelector(state => state.nav.title);

    const clickHandler = ({ name, path }, idx) => {
        if (path === "login") {
            // Clear localStorage when Sign Out is clicked
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_role');
        }
        dispatch(changeTitle(name));
        setIndex(idx);
    }

    useEffect(()=>{
        let idx = menuItems.findIndex(item => item.name === title);
        setIndex(idx);
    }, [title]);

    return (
        <div className="navbar-mobile">
            <div className="nav-list">
                {menuItems.map((item, idx) => 
                    <NavLink to={item.path} key={idx.toString()} onClick={clickHandler.bind(this, item, idx)}>
                        <div className="menu-item">
                            <img src={index===idx?item.iconActive:item.icon} alt={item.name} />
                            <div className="title">{item.name}</div>
                        </div>
                    </NavLink>
                )}
            </div>
        </div>
    );
}

export default NavBarMobile;