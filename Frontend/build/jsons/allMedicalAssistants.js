// Inside your component where you want to fetch medical assistants list

import React, { useState, useEffect } from "react";
import axios from "axios";

const MedicalAssistants = () => {
    const [medicalAssistants, setMedicalAssistants] = useState([]);

    useEffect(() => {
        // Fetch medical assistants list from backend when component mounts
        fetchMedicalAssistants();
    }, []);

    const fetchMedicalAssistants = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5401/api/medicalassistants');
            setMedicalAssistants(response.data); // Assuming response.data is an array of medical assistants
        } catch (error) {
            console.error('Error fetching medical assistants:', error);
        }
    };

    return (
        <div>
            {/* Render medical assistants list */}
            <ul>
                {medicalAssistants.map((assistant) => (
                    <li key={assistant.id}>{assistant.fullName}</li>
                ))}
            </ul>
        </div>
    );
}

export default MedicalAssistants;
