import React from "react";
import { useSelector } from "react-redux";
import useTranslations from "../../Translations/useTranslations";

const Details = () => {
    const translations = useTranslations();
    return (
        <>
            <h1><div className="label">{translations["Details"]}</div></h1>
            {/* Render other translated content here */}
        </>
    );
}

export default Details;
