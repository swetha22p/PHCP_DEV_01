const endpoints = {
    baseUrl: 'http://127.0.0.1:5401',
    drives: {
        getAllDrives: '/get_drives',
        getDriveDetails: '',
        getAllForms: '/get_forms',
        getAllAssistants: '/assistants',
        getAllMedicalAssistants: '',
        getAllFields: '/fields',
        saveFormData: '/create_form',
        saveDriveData: '/create_drive',
    },
    screeningAPIs: {
        getScreeningAPIs: '',
    },
    user: {
        login: '',
    }
};

export default endpoints;