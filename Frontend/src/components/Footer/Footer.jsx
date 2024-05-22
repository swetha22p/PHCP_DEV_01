import React from "react";
import './Footer.scss';
import { useSelector } from "react-redux";
import useTranslations from "../Translations/useTranslations";

const Footer = (props) => {
    const translations = useTranslations();

    
    const copyrightText = translations && translations.footerCopyright;
    
    return (
        <div className="main-footer" style={{ height: props.height }}>
            <div className="label">
                {copyrightText}
            </div>
        </div>
    );
}

export default Footer;