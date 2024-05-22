import React from "react";
import TopBar from "../TopBar/TopBar";
import useTranslations from "../Translations/useTranslations";



const Tools = () => {
    const translations = useTranslations();
    const dataTabs = [
        { name: translations["Drives & Forms"], path: "drives-forms" },
        { name: translations["Screening APIs"], path: "screening-apis" },
    ];
    
    return (
        <>
            <TopBar tabs={dataTabs}/>
        </>
    );
}

export default Tools;