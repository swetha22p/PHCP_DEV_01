import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllFields } from "../../../store/features/tools/driveSlice";
import { useForm } from 'react-hook-form';
import useTranslations from "../../Translations/useTranslations";
import styles from './MedicalAssistants.module.scss';
import axios from "axios";
import { Button, TextField, Typography, Container } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { message } from 'antd';


const useStyles = makeStyles((theme) => ({
  formContainer: {
    marginTop: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  formField: {
    margin: theme.spacing(1),
    width: '100%',
  },
  submitButton: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const MedicalAssistants = () => {
    const translations = useTranslations();
    const [showForm, setShowForm] = useState(false);
    const user = useSelector(state => state.user);
    const { register, handleSubmit } = useForm();
    const dispatch = useDispatch();
    const classes = useStyles();
    const [formData, setFormData] = useState({
        username: '',
        location: ''
    });

    useEffect(() => {
        dispatch(fetchAllFields());
    }, [dispatch]);

    const handleAddButtonClick = () => {
        setShowForm(true);
    };

    const onClose = () => {
        setShowForm(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault(); // Prevent page reload
        try {
            const response = await axios.post('http://127.0.0.1:5401/api/medicalassistants', {
                username: formData.username,
                location: formData.location
            });
            console.log(response.data);
            // Reset form data after successful submission
            setFormData({
                username: '',
                location: ''
            });
            setShowForm(false);
            message.success('Medical assistant added successfully');
        } catch (error) {
            console.error('Error:', error);
            message.error('Failed to add medical assistant');
        }
    };
    
    

    const AddAssistantButton = () => {
        return (
            <div className='addButton' onClick={handleAddButtonClick}>
                <i className="pi pi-plus"></i>
                <img src="/assets/icons/common/user.svg" alt='Vector'></img>
                <h1><div className="label">{translations["Add Medical Assistant"]}</div></h1>
            </div>
        )
    }

    const Searchbar = () => {
        return (
            <div className="searchBar">
                <input type="text" />
                <div className="searchIcon">
                    <i className="pi pi-search"></i>
                </div>
            </div>
        )
    }

    return (
        <div className="assistant">
            {showForm && (
                <SelectFieldTemplate
                    register={register}
                    handleSubmit={handleSubmit}
                    handleFormSubmit={handleFormSubmit}
                    user={user}
                    translations={translations}
                    onClose={onClose}
                    classes={classes}
                    formData={formData}
                    handleChange={handleChange}
                />
            )}
            {AddAssistantButton()}
            {Searchbar()}
        </div>
    );
}

const SelectFieldTemplate = ({ register, handleSubmit, handleFormSubmit, user, translations, onClose, classes, formData, handleChange }) => {
    return (
        <div className={styles.container}>
            <form className={styles.form} >
                
                <div className={styles.header}>
                    <div className={styles.header__body}>
                        <div className={styles.header__title}>
                            <h1>Medical Assistants</h1>
                        </div>
                        <div className={styles.header__metadata}>
                            <div className={styles.header_metadata_item}>
                                Created By: {user.firstName} {user.lastName}
                            </div>
                            <div className={styles.header_metadata_item}>
                                Date created: {new Date().toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                    <div className={styles.header__close}>
                        <i className="pi pi-times-circle" onClick={onClose}></i>
                    </div>
                </div>
                <div className={styles.body}>
                    <Container component="main" maxWidth="xs">
                        <div className={classes.formContainer}>
                            <Typography variant="h5">Add Medical Assistant</Typography>
                            <form>
                                <TextField
                                    className={classes.formField}
                                    variant="outlined"
                                    label="Username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                                <TextField
                                    className={classes.formField}
                                    variant="outlined"
                                    label="Location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                />
                                <Button
                                    className={classes.submitButton}
                                    // type="submit"
                                    variant="contained"
                                    color="primary"
                                    onClick={handleFormSubmit}
                                >
                                    Submit
                                </Button>
                            </form>
                        </div>
                    </Container>
                </div>
                <div className={styles.footer}>
                    {/* Footer buttons */}
                </div>
            </form>
        </div>
    );
}

export default MedicalAssistants;
