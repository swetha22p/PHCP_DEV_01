import React from "react";
import { useSelector } from "react-redux";
import useTranslations from "../../Translations/useTranslations";

const Account = () => {
    const translations = useTranslations();
    
    

    return (
        <>
             <h1><div className="label">{translations["Account"]}</div></h1>
        </>
    );
}

export default Account;