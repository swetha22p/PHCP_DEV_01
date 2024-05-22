import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, Outlet } from 'react-router-dom';
import { toggle } from '../../store/features/nav/navSlice';
import './TopBar.scss';
import useTranslations from '../Translations/useTranslations';

const TopBar = (props) => {
    const title = useSelector((state) => state.nav.title);
    const dispatch = useDispatch();
    const translations = useTranslations();
    const translatedTitle = translations[title] || title;

    const [logoUrl, setLogoUrl] = useState('');

    useEffect(() => {
        // Retrieve organization name from local storage
        const organizationName = localStorage.getItem('organization');
        const organizationlogo = localStorage.getItem('logo')
        if (organizationlogo) {
            setLogoUrl(organizationlogo);
            console.log('Logo URL:', organizationlogo);
        }
    }
)

        // Load logo URL based on organization name
    //     if (organizationName) {
    //         fetch(`http://127.0.0.1:5401/api/organization/${organizationName}`)
    //             .then((response) => {
    //                 console.log(response)
    //                 if (!response.ok) {
    //                     throw new Error('Failed to fetch logo URL');
    //                 }
    //                 return response.json();
    //             })
    //             .then((data) => {
    //                 // Assuming the response data contains a 'logoUrl' field
    //                 console.log(data)
    //                 const organizationLogoUrl = data;
    //                 if (organizationlogo) {
    //                     setLogoUrl(organizationlogo);
    //                     console.log('Logo URL:', organizationlogo);
    //                 }
    //             })
    //         // }
    //             .catch((error) => {
    //                 console.error('Error fetching logo URL:', error);
    //                 // Handle error
    //             });
    //     }
    // }, [localStorage.getItem('organization')]); // Include localStorage.getItem('organization') in dependency array

    return (
        <div className="topbar">
            <div className="title-container">
                <img
                    className="hamburger"
                    src="https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/web/non-active/hamburger.svg"
                    alt="Hamburger"
                    onClick={() => {
                        dispatch(toggle());
                    }}
                />
                <div className="title">{translatedTitle}</div>
                <div className="logo">
                    {console.log(logoUrl)}
                    <img src={logoUrl}  alt="logo" />

                </div>
            </div>
            <div className="tabs">
                {props.tabs &&
                    props.tabs.map((i, idx) => (
                        <NavLink to={i.path} key={idx.toString()}>
                            <div className="tab-item">{i.name}</div>
                        </NavLink>
                    ))}
            </div>
            <Outlet />
        </div>
    );
};

export default TopBar;
