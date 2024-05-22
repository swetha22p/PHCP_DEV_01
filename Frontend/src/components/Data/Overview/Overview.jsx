import React from "react";
import { useSelector } from "react-redux";
import useTranslations from "../../Translations/useTranslations";
const Overview = () => {
    const translations = useTranslations();
    return (
        <>
             <h1><div className="label">{translations["Overview"]}</div></h1>
        </>
    );
}

export default Overview;