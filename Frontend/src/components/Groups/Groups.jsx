import React from "react";
import { useOutletContext } from "react-router-dom";
import { useSelector } from "react-redux";
import TopBar from "../TopBar/TopBar";
import useTranslations from "../Translations/useTranslations";

const Groups = () => {
    // Get the current language from Redux state
  
    // Get the title from the router context
    const title = useOutletContext();

    // Get the translated tabs based on the current language
    const translations = useTranslations();

    // Define tabs with translated names
    const groupsTabs = [
        { name: translations.assistants, path: "assistants" },
        { name: translations.medicalAssistants, path: "medical-assistants" },
    ];

    return (
        <>
            <TopBar title={title} tabs={groupsTabs}/>
        </>
    );
}

export default Groups;
