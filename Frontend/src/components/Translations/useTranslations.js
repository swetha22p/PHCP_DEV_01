import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const useTranslations = () => {
    const language = useSelector(state => state.nav.language);
    const [translations, setTranslations] = useState({});

    useEffect(() => {
        const fetchTranslations = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5401/api/translations/${language}`);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch translations for language: ${language}`);
                }
                const translationsData = await response.json();
                // console.log(translationsData)
                setTranslations(translationsData);
            } catch (error) {
                console.error("Error fetching translations:", error);
            }
        };

        fetchTranslations();
    }, [language]);

    return translations;
};

export default useTranslations;
