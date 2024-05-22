import { useOutletContext } from "react-router-dom";
import TopBar from "../TopBar/TopBar";
import { useSelector } from "react-redux";
import useTranslations from "../Translations/useTranslations";



const Home = () => {
    const translations = useTranslations();
    const title = useOutletContext();
   
    const homeTabs = [
        { name: translations.Account, path: "account" },
        { name: translations.Dashboard, path: "dashboard" },
    ];
    return (
        <>
            <TopBar title={title} tabs={homeTabs}/>
        </>
    );
}

export default Home;