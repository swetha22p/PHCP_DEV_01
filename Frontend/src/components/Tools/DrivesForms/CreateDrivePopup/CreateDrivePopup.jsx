import React, { useEffect, useRef, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import styles from "./CreateDrivePopup.module.scss";
import { countries } from "../../../../constants/global";
import { FileUpload } from 'primereact/fileupload';
import * as XLSX from 'xlsx';
import axios from 'axios';

import { Calendar } from 'primereact/calendar';
import { MultiSelect } from 'primereact/multiselect';
import { fetchAllAssistants, fetchAllForms, fetchAllMedicalAssistants, saveDrive } from "../../../../store/features/tools/driveSlice";
        
const FileUploadPopup = ({type, dataList, setValue, onClose, driveName}) => {
    const uploadRef = useRef(null);
    const label = type === "assistants" ? "Assistants" : "Medical Assistants";

    const customUploader = async (event) => {
        const file = event.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            console.log(jsonData);
            let dataFromFile = [];
            jsonData.forEach((item,idx) => {
                let obj = {"id": item["Id"], "fullName": item["Full Name"]};
                if(dataList.findIndex((ast)=> ast.id === obj.id) !== -1){
                    dataFromFile.push(obj);
                }
            });
            setValue(type, dataFromFile);
        };
    
        reader.readAsArrayBuffer(file);
        onClose();
    };

    const emptyTemplate = () => {
        return (
            <>
                <h2><i className="pi pi-upload" style={{margin: '0px 10px', fontSize: '1.5rem'}}></i>   Add File</h2>
            </>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.form}>
                <div className={styles.header}>
                    <div className={styles.header__body}>
                        <div className={styles.header__title}>
                            <div className={styles.header__title__text}>{driveName}</div>
                        </div>
                    </div>
                    <div className={styles.header__close}>
                        <i className="pi pi-times-circle" onClick={onClose}></i>
                    </div>
                </div>

                <div className={`${styles.form_container} ${styles.upload_form_container}`}>
                    <div className={styles.form_container__item}>
                        <div className={styles.form_container__item__label}>{label} Upload</div>
                    </div>
                    <div className={styles.fileUploadText}> Please choose an Excel File containing the details of {label} for upload. <br/> Make sure that the uploaded file is in the required format.</div>
                    <div className={styles.fileUploadBox}>
                        <div className={styles.fileUploadBox__body}>
                            <FileUpload className="personnel_data" ref={uploadRef} name="demo[]" emptyTemplate={emptyTemplate} chooseLabel="Add File" customUpload uploadHandler={customUploader}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}

const CreateDrivePopup = (props) => {
    const  user = useSelector(state => state.user);
    const formList = useSelector(state => state.drive.formList);
    const assistantList = useSelector(state => state.drive.assistantList);
    const medicalAssistantList = useSelector(state => state.drive.medicalAssistantList);
    const [assistantFileUploadWindow, setAssistantFileUploadWindow] = useState(false);
    const [medicalAssistantFileUploadWindow, setMedicalAssistantFileUploadWindow] = useState(false);
    const [medicalAssistants, setMedicalAssistants] = useState([]);
    const [showTextBox, setShowTextBox] = useState(false);
    const [showAttachmentInput, setShowAttachmentInput] = useState(false);
    const [showVideoAttachmentInput, setShowVideoAttachmentInput] = useState(false);

    const handleCheckboxVideoChange = (event) => {
        setShowVideoAttachmentInput(event.target.checked);
    };

    const handleCheckboxAudioChange = (event) => {
        setShowAttachmentInput(event.target.checked);
    };

    const { register, control, handleSubmit, setValue, getValues } = useForm({});

    const handleCheckboxChange = (event) => {
        setShowTextBox(event.target.checked);
    };

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchAllForms());
        dispatch(fetchAllAssistants());
        // Fetch medical assistants list from backend when component mounts
        fetchMedicalAssistants();
    }, [dispatch]);

    const fetchMedicalAssistants = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5401/api/medicalassistants');
            const usernames = response.data.map(assistant => assistant.username);
            console.log(usernames);
            setMedicalAssistants(usernames);
        } catch (error) {
            console.error('Error fetching medical assistants:', error);
        }
    };
    

    const onSubmit = (data) => {
        console.log(data);

        let payload = {
            location: {
                district: data['driveLocation']['district'],
                city: data['driveLocation']['city'],
                state: data['driveLocation']['state'],
                pincode: data['driveLocation']['pincode'],
                country: data['driveLocation']['country']
            },
            organisation_name: "XYZ Medical Foundation",
            organisation_id: "ORG_001",
            manager_name: data['driveManager'],
            start_date: (new Date(data['driveStartDate'])).toLocaleDateString(),
            end_date: (new Date(data['driveEndDate'])).toLocaleDateString(),
            // form_id: data['formId'],
            // assistants: data['assistants'],
            medical_assistants: data['medicalAssistants'],
            created_date: new Date().toLocaleDateString(),
            created_by: user.id,
            name: data['driveName']
        }

        dispatch(saveDrive(payload));

        props.onClose();
    };


    return (
        <div className={styles.container}>
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                <div className={styles.header}>
                    <div className={styles.header__body}>
                        <div className={styles.header__title}>
                            <input type="text" placeholder="Drive Name" {...register("driveName", {required: "This field is required."})}/>
                        </div>
                        <div className={styles.header__metadata}>
                            <div className={styles.header__metadata__item}>
                                Created By: {user.firstName} {user.lastName}
                            </div>
                            <div className={styles.header__metadata__item}>
                                Date created: {new Date().toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                    <div className={styles.header__close}>
                        <i className="pi pi-times-circle" onClick={props.onClose}></i>
                    </div>
                </div>

                <div className={styles.form_container}>
                    <div className={styles.form_container__item}>
                        <div className={styles.form_container__item__label}>About Drive</div>
                        <div className={styles.form_container__item__input}>
                            <textarea placeholder="Enter description about drive" {...register("driveDescription")} />
                        </div>
                    </div>
                    <div className={styles.form_container__item}>
                        <div className={styles.form_container__item__label}>Drive Location</div>
                        <div className={styles.form_container__item__input}>
                            <div className={styles.form_container__item__input__group}>
                                <input type="text" placeholder="District Name" {...register("driveLocation.district")} />
                                <input type="text" placeholder="City, Town, or Village Name" {...register("driveLocation.city")}/>
                                <input type="text" placeholder="Pincode" {...register("driveLocation.pincode")}/>
                            </div>
                            <div className={styles.form_container__item__input__group}>
                                <input type="text" placeholder="State" {...register("driveLocation.state")}/>
                                <select value="IN" {...register("driveLocation.country")}>
                                    {countries.map((country, idx) => (
                                        <option key={idx} value={country.code}>{country.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className={styles.form_container__item}>
                        <div className={styles.form_container__item__label}>Drive Manager</div>
                        <div className={styles.form_container__item__input}>
                            <input type="text" placeholder="Enter name of drive manager" {...register("driveManager")}/>
                        </div>
                    </div>
                    {/* <div className={styles.form_container__item}> */}
                        {/* <div className={styles.form_container__item__label}>Assistants</div>
                        <div className={styles.form_container__item__input}>
                            <Controller
                                name="assistants"
                                control={control}
                                rules={{ required: 'This field is required.' }}
                                render={({ field }) => (
                                    <MultiSelect className={styles.multiselect}
                                        id={field.id} 
                                        name="assistants" 
                                        value={field.value} 
                                        optionLabel="fullName" 
                                        options={assistantList} 
                                        onChange={(e) => field.onChange(e.value)} 
                                        filter={true}
                                        display="chip"
                                        placeholder="Select Assistants"/>
                                )}
                            />
                            <img className={styles.fileUpload} src="https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/common/fileUpload.svg" alt="fileUpload" onClick={() => setAssistantFileUploadWindow(true)} />
                            {assistantFileUploadWindow && <FileUploadPopup type="assistants" dataList={assistantList} setValue={setValue} onClose={() => setAssistantFileUploadWindow(false)} driveName={getValues("driveName")} />}
                        </div>
                    </div> */}
                     <div className={styles.form_container__item}>
                <div className={styles.form_container__item__label}>Number of Medical Assistants</div>
                <div className={styles.form_container__item__input}>
                    <input type="number" {...register("numberOfMedicalAssistants")} />
                </div>
            </div>
                    <div className={styles.form_container__item}>
                        <div className={styles.form_container__item__label}>Medical Assistants</div>
                        <div className={styles.form_container__item__input}>
                            <Controller
                                name="medicalAssistants"
                                control={control}
                                rules={{ required: 'This field is required.' }}
                                render={({ field }) => (
                                    <MultiSelect
    className={styles.multiselect}
    id={field.id}
    name="medicalAssistants"
    value={field.value}

    options={medicalAssistants} // medicalAssistants is an array of usernames
    onChange={(e) => {
        console.log("Selected Medical Assistants:", e.value);
        field.onChange(e.value);
    }}
    filter={true}
    display="chip"
    placeholder="Select Medical Assistants"
/>

                                )}
                            />
                            <img className={styles.fileUpload} src="https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/common/fileUpload.svg" alt="fileUpload" onClick = {()=> setMedicalAssistantFileUploadWindow(true)}/>
                            {medicalAssistantFileUploadWindow && <FileUploadPopup type="medicalAssistants" dataList={medicalAssistantList} setValue={setValue} onClose={() => setMedicalAssistantFileUploadWindow(false)} />}
                        </div>
                    </div>
                    <div className={styles.form_container__item}>
                <div className={styles.form_container__item__label}>Number of Subjects</div>
                <div className={styles.form_container__item__input}>
                    <input type="number" {...register("numberOfSubjects")} />
                </div>
            </div>
           
            <div className={styles.form_container__item}>
                <div className={styles.form_container__item__label}>Form Name</div>
                <div className={styles.form_container__item__input}>
                    <input type="text" {...register("formName")} />
                </div>
            </div>
                    <div className={styles.form_container__item}>
                <div className={styles.form_container__item__label}>Consent Mechanisms</div>
                <div className={styles.form_container__item}>
                <div>
            <input 
                type="checkbox" 
                id="writtenConsent" 
                {...register("consentMechanisms.writtenConsent")} 
                onChange={handleCheckboxChange} 
            />
            <label htmlFor="writtenConsent"> written type</label>

            {showTextBox && (
                <div>
                    <input 
    type="text" 
    id="writtenTextBox" 
    placeholder="Enter text" 
    {...register("writtenTextBox")} 
    className={styles.largeInput} // Add a class for styling
/>

                </div>
            )}
        </div>
        <div>
            <div>
                <input 
                    type="checkbox" 
                    id="audioRecordingConsent" 
                    {...register("consentMechanisms.audioRecordingConsent")} 
                    onChange={handleCheckboxAudioChange} 
                />
                <label htmlFor="audioRecordingConsent">audio recording</label>
            </div>

            {showAttachmentInput && (
                <div>
                    <input 
                        type="file" 
                        id="audioAttachment" 
                        {...register("audioAttachment")} 
                    />
                </div>
            )}
        </div>
        <div>
            <div>
                <input 
                    type="checkbox" 
                    id="videoRecordingConsent" 
                    {...register("consentMechanisms.videoRecordingConsent")} 
                    onChange={handleCheckboxVideoChange} 
                />
                <label htmlFor="videoRecordingConsent">video recording</label>
            </div>

            {showVideoAttachmentInput && (
                <div>
                    <input 
                        type="file" 
                        id="videoAttachment" 
                        {...register("videoAttachment")} 
                    />
                </div>
            )}
        </div>

                    <div>
                        <input type="checkbox" id="otherConsent" {...register("consentMechanisms.otherConsent")} />
                        <label htmlFor="otherConsent">Other (please specify)</label>
                        <input type="text" {...register("consentMechanisms.otherConsentDetails")} />
                    </div>
                </div>
            </div>
                    <div className={styles.form_container__item}>
                        <div className={styles.form_container__item__input__group}>
                            <div className={styles.form_container__item__label}>Drive Start Date</div>
                            <div className={`${styles.form_container__item__input} ${styles.flex_2}`}>
                                <Controller
                                    name="driveStartDate"
                                    control={control}
                                    rules={{ required: 'Date is required.' }}
                                    render={({ field, fieldState }) => (
                                        <Calendar 
                                            placeholder="Select Start Date"
                                            inputId={field.name} 
                                            value={field.value} 
                                            onChange={field.onChange} 
                                            dateFormat="dd/mm/yy" 
                                            className={styles.calendar}
                                            showIcon
                                        />
                                    )}
                                />
                            </div>
                            <div style={{flex: '0.3'}}></div>
                            <div className={styles.form_container__item__label}>Drive End Date</div>
                            <div className={`${styles.form_container__item__input} ${styles.flex_2}`}>
                                <Controller
                                    name="driveEndDate"
                                    control={control}
                                    rules={{ required: 'Date is required.' }}
                                    render={({ field, fieldState }) => (
                                        <Calendar 
                                            placeholder="Select End Date"
                                            inputId={field.name} 
                                            value={field.value} 
                                            onChange={field.onChange} 
                                            dateFormat="dd/mm/yy" 
                                            className={styles.calendar}
                                            showIcon
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                    <div className={styles.form_container__item}>
                        {/* <div className={styles.form_container__item__input__group}>
                            <div className={styles.form_container__item__label}>Select Form</div>
                            <div className={`${styles.form_container__item__input} ${styles.flex_2}`}>
                                <select placeholder="Select Form" {...register("formId")}>
                                    {formList.map((form) => (
                                        <option key={form.formId} value={form.formId}>{form.formName}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{flex: '1', textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem'}}>OR</div>
                            <button className={styles.form_container__item__button} onClick={() => {props.onCreateFormClick()}}>translations.Create Form</button>
                        </div> */}
                    </div>
                </div>
                <div className={styles.footer}>
                    <button>
                        Create Drive
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateDrivePopup;
