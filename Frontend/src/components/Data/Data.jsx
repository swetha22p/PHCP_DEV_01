import { useOutletContext } from "react-router-dom";
import TopBar from "../TopBar/TopBar";
import React from "react";
import { useSelector } from "react-redux";
import useTranslations from "../Translations/useTranslations";


const Data = () => {
    const translations = useTranslations();
    
    const title = useOutletContext();
    const dataTabs = [
        { name: translations.Overview, path: "overview" },
        { name: translations.Details, path: "details" },
    ];
    return (
        <>
            <TopBar title={title} tabs={dataTabs}/>
            <h1><div className="label">{translations["Data"]}</div></h1>
        </>
    );
}

export default Data;