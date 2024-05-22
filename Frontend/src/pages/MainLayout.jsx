import './MainLayout.scss';
import {Outlet } from 'react-router-dom';
import Footer from '../components/Footer/Footer';
import NavBar from "../components/NavBar/NavBar";
import NavBarMobile from '../components/NavBarMobile/NavBarMobile';


const MainLayout = () => {

    return (
        <div className="layout-container">
            <NavBar />
            <div className="main-container">
                <div className="sub-container">
                    <Outlet />
                </div>
                <Footer height={'5vh'} />
                <NavBarMobile />
            </div>
        </div>
    );
}

export default MainLayout;