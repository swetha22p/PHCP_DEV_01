import React, { useEffect, useState , useRef} from "react";
import DriveInfoPopup from "./DriveInfoPopup/DriveInfoPopup";
import styles from "./DriveForms.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllDrives, fetchAllForms, resetError, resetSuccess } from "../../../store/features/tools/driveSlice";
import CreateDrivePopup from "./CreateDrivePopup/CreateDrivePopup";
import CreateFormPopup from "./CreateFormPopup/CreateFormPopup";
import { showToast } from "../../../store/features/toast/toastSlice";
import axios from "axios";
import { Modal , Button , message} from 'antd';
import { FileAddOutlined } from '@ant-design/icons';
import { openDB } from 'idb';
import AWS from 'aws-sdk';
import * as idb from 'idb';
import Test from './Test';
import useTranslations from "../../Translations/useTranslations";


const minioEndpoint = 'https://pl-minio.iiit.ac.in';
const accessKey = 'minioadmin';
const secretKey = 'minioadmin';
const bucketName = 'test';

AWS.config.update({
  accessKeyId: accessKey,
  secretAccessKey: secretKey,
  endpoint: minioEndpoint,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

const s3 = new AWS.S3();

const minioUploader = async (file, fileName) => {
    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: file,
      ContentType: file.type,
      ContentDisposition: `attachment; filename="${fileName}"`,
    };
  
    try {
      const response = await s3.upload(params).promise();
      return response.Location; // Assuming MinIO provides the URL in the response
    } catch (error) {
      console.error('Error uploading to MinIO:', error);
      throw error;
    }
  };
  



const DrivesForms = () => {
    const [ popupVisible, setPopupVisible] = useState(false);
    const [ createDrivePopup, setCreateDrivePopup ] = useState(false);
    const [ createFormPopup, setCreateFormPopup ] = useState(false);
    const [driveList, setDriveList] = useState([]);
    const [formList, setFormList] = useState([]);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [mongoDBCount, setMongoDBCount] = useState(0);
    const [indexedDBCount, setIndexedDBCount] = useState(0);
    const [searchInput, setSearchInput] = useState("");
    const [syncCount, setSyncCount] = useState(0);
    const [numRecords, setnumRecords] = useState(); // Default to 4
    const [dataFetchedOnce, setDataFetchedOnce] = useState(false);
    const translations = useTranslations();


    const imageCache = [];
const audioCache = [];
    


    const onlineHandlerExecuted = useRef(false);
    const dispatch = useDispatch();
  

    // const success = useSelector(state => state.drive.success);
    // const error = useSelector(state => state.drive.error);


    const handleNumToCacheChange = (e) => {
        setnumRecords(parseInt(e.target.value));
    };


  

    const driveData = {
        title: "Existing Drives",
        // listItems: []
    };
    const [ formData, setFormData ] = useState({
        title: "Existing Forms",
        listItems: []
    });

    // driveData.listItems = useSelector(state => state.drive.driveList);
    // formData.listItems = useSelector(state => state.drive.formList);
    
     // useRef to track whether online handler has been executed

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (success) {
            dispatch(showToast({ toastType: "success", toastMessage: success }));
            setSuccess(null);
        }
        if (error) {
            dispatch(showToast({ toastType: "error", toastMessage: error }));
            setError(null);
        }
    }, [success, error, dispatch]);

    useEffect(() => {
        const onlineEventHandler = async () => {
            if (!onlineHandlerExecuted.current) { // Check if online handler has been executed
                console.log('online');
                const lastSynchronizedTimestamp = sessionStorage.getItem('lastSynchronizedTimestamp');
    
                const lastSyncDate = new Date(parseInt(lastSynchronizedTimestamp));
                console.log("lastSynchronizedTimestamp:", lastSyncDate.toLocaleString()); // Convert to normal date format
    
                console.log("lastSynchronizedTimestamp:", lastSyncDate);
                if (lastSynchronizedTimestamp) {
                    try {
                        // Get offline data since the last synchronized timestamp
                        const offlineData = await getOfflineDataSince(lastSyncDate);
                        // Synchronize offline data with MongoDB
                        await synchronizeOfflineData(offlineData);
                        // Update last synchronized timestamp to current time
                        const currentTimestamp = Date.now();
                        sessionStorage.setItem('lastSynchronizedTimestamp', currentTimestamp);
                        // Mark online handler as executed
                        onlineHandlerExecuted.current = true;
                    } catch (error) {
                        console.error('Error handling offline data:', error);
                    }
                }
            }
        };
    
        window.addEventListener('online', onlineEventHandler);
    
        // Cleanup function to remove event listener
        return () => {
            window.removeEventListener('online', onlineEventHandler);
        };
    }, []);
    
    const handleOffline = () => {
        // Browser went offline, set session storage item
        const currentTimestamp = Date.now();
        sessionStorage.setItem('lastSynchronizedTimestamp', currentTimestamp);
    };
    
    window.addEventListener('offline', handleOffline);



    
   // In your fetchData function, pass the number of records to cache as a parameter

const fetchData = async (numRecords) => {
    console.log(imageCache)
    console.log(numRecords)
    try {
        // Check network status
        const isOnline = navigator.onLine;


        if (isOnline) {
            // Fetch data from MongoDB
            // https://pl-api.iiit.ac.in/rcts/phcp2/api/get-data'
            const response = await axios.get('http://127.0.0.1:5401/rcts/phcp2/api/get-data');
            console.log(response.data);

            if (response.status === 200) {
                const data = response.data;
                const mongoDBCount = data.length;
            

                if (numRecords > mongoDBCount) {
                    const message = `Entered number ${numRecords} is greater than MongoDB count ${mongoDBCount}. Only ${mongoDBCount} records will be fetched.`;
                    console.warn(message);
                    window.alert(message); // Display popup message
                    numRecords = mongoDBCount;
                }


                
                // Update both formList state variable and formData.listItems
                setFormList(data);
                setFormData(prevState => ({
                    ...prevState,
                    listItems: data
                }));
                cacheLastRecordedImages(data, numRecords,imageCache); // Pass numRecords to cacheLastRecordedImages
                cacheLastRecordedAudio(data, numRecords , audioCache);
                const messageText = `${numRecords} records fetched.`;
                    // Display success message only after the first fetch
                    if (dataFetchedOnce) {
                        message.success(messageText);
                    }
                    setDataFetchedOnce(true); // Update state to indicate data has been fetched at least once
                

                // clearIndexedDBFields(imageCache, audioCache);
                
            }
        } else {
            // Fetch data from IndexedDB
            const indexedDBData = await fetchDataFromIndexedDB();
            // Update both formList state variable and formData.listItems
            setFormList(indexedDBData);
            setFormData(prevState => ({
                ...prevState,
                listItems: indexedDBData
            }));
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data.');
    }
};

// Modify your cacheLastRecordedImages function to accept the number of records as a parameter
const cacheLastRecordedImages = async (data, numRecords, imageCache) => {
    console.log(numRecords)
    try {
        // Get the current cache keys
        const cache = await caches.open('image-cache');
        const currentCacheKeys = await cache.keys();

        // Select the last recorded n records
        const lastRecordedRecords = data.slice(-numRecords); // Ensure numRecords is used correctly here
        console.log('Last recorded records:', lastRecordedRecords);

        // Cache images associated with the last recorded records
        const cachePromises = lastRecordedRecords.map(async (record) => {
            const imageUrl = record.imageUrl;
            const _id = record._id
            const response = await fetch(imageUrl);
            if (response.ok) {
                // Cache the image
                await cache.put(imageUrl, response);
                console.log('Image cached:', imageUrl);

                // Add the image URL to the imageCache array
               
               
                imageCache.push({ _id, imageUrl })
                console.log('imgcache',imageCache)
            } else {
                console.error('Failed to cache image:', imageUrl);
            }
        });

        // Remove the oldest records from cache if cache size exceeds n
        console.log(currentCacheKeys.length)
        console.log(lastRecordedRecords.length)
        console.log(numRecords)
        const numToRemove = currentCacheKeys.length + lastRecordedRecords.length - numRecords;
        console.log(numToRemove)
        if (numToRemove > 0) {
            const keysToRemove = currentCacheKeys.slice(0, numToRemove);
            await Promise.all(keysToRemove.map(key => cache.delete(key)));
            console.log(`Removed ${numToRemove} old cached images.`);
        }

        await Promise.all(cachePromises);
    } catch (error) {
        console.error('Error caching images:', error);
    }
};


// Modify your cacheLastRecordedAudio function similarly


    // Modify your cacheLastRecordedAudio function to accept the number of records as a parameter
    const cacheLastRecordedAudio = async (data, numRecords, audioCache) => {
        try {
            // Get the current cache keys for audio
            const cache = await caches.open('audio-cache');
            const currentCacheKeys = await cache.keys();
    
            // Select the last recorded n records
            const lastRecordedRecords = data.slice(-numRecords);
            console.log('Last recorded records:', lastRecordedRecords);
    
            // Cache audio files associated with the last recorded records
            const cachePromises = lastRecordedRecords.map(async (record) => {
                const audioUrl = record.modalAudioUrl;
                const _id = record._id;
                const response = await fetch(audioUrl);
                if (response.ok) {
                    // Cache the audio file
                    await cache.put(audioUrl, response);
                    console.log('Audio cached:', audioUrl);
    
                    // Add the audio URL to the audioCache array
                    
                   
                    audioCache.push({ _id, audioUrl })
                    
                    console.log('aud',audioUrl)
                } else {
                    console.error('Failed to cache audio:', audioUrl);
                }
            });
    
            // Remove the oldest audio files from cache if cache size exceeds n
            const numToRemove = currentCacheKeys.length + lastRecordedRecords.length - numRecords;
            if (numToRemove > 0) {
                const keysToRemove = currentCacheKeys.slice(0, numToRemove);
                await Promise.all(keysToRemove.map(key => cache.delete(key)));
                console.log(`Removed ${numToRemove} old cached audio files.`);
            }
    
            await Promise.all(cachePromises);
        } catch (error) {
            console.error('Error caching audio files:', error);
        }
    };
    


//     const playCachedAudio = async (audioUrl) => {
//     try {
//         // Open the cache for audio files
//         const cache = await caches.open('audio-cache');

//         // Fetch the audio file from the cache
//         const response = await cache.match(audioUrl);
//         if (response) {
//             // Convert the response to a blob
//             const blob = await response.blob();
//             const objectURL = URL.createObjectURL(blob);

//             // Create an audio element and play the audio
//             const audio = new Audio(objectURL);
//             audio.play();
//         } else {
//             console.error('Audio not found in cache:', audioUrl);
//         }
//     } catch (error) {
//         console.error('Error playing cached audio:', error);
//     }
// };

    
    
    const getOfflineDataSince = async (timestamp) => {
        try {
            const db = await openDB('formDataDB', 1);
            const store = db.transaction('formDataStore').objectStore('formDataStore');
    
            // Get all data from the store
            const allData = await store.getAll();
    
            console.log('Retrieved all offline data:', allData);
    
            // Filter data since the provided timestamp
            console.log(timestamp)
            const filteredData = allData.filter(entry => new Date(entry.timestamp) > timestamp);
    
            console.log('Filtered offline data:', filteredData);
    
            return filteredData;
        } catch (error) {
            console.error('Error getting offline data:', error);
            return [];
        }
    };

    // Function to clear modalAudioUrl and imageUrl fields from IndexedDB records
// Function to clear modalAudioUrl and imageUrl fields from IndexedDB records
// const clearIndexedDBFields = async (imageCache, audioCache) => {
//     console.log('true');
//     try {
//         console.log("imageCache:", imageCache); // Log imageCache array
        
//         const db = await openDB('formDataDB', 1);
        
//         const formDataTransaction = db.transaction('formDataStore', 'readwrite');
//         const formDataStore = formDataTransaction.objectStore('formDataStore');
//         const formDataKeys = await formDataStore.getAllKeys();
        
//         for (const key of formDataKeys) {
//             const formData = await formDataStore.get(key);
//             if (formData) {
//                 console.log('ins');
//                 console.log("formData._id:", formData._id);
//                 // Iterate through imageCache
//                 for (const item of imageCache) {
//                     console.log(item)
//                     console.log("item._id:", item._id); // Log item._id
                    
//                     // Check if item._id matches formData._id
//                     if (item._id === formData._id) {
//                         // Update imageUrl
//                         formData.imageUrl = item.imageUrl;
                       
//                         break; // Break the loop once found
//                     }
//                     else{
//                         formData.imageUrl = 'null'
//                     }
//                 }
//                 for (const item of audioCache) {
//                     console.log("item._id:", item._id); // Log item._id
                    
//                     // Check if item._id matches formData._id
//                     if (item._id === formData._id) {
//                         // Update imageUrl
//                         formData.modalAudioUrl = item.audioUrl;
                       
//                         break; // Break the loop once found
//                     }
//                     else{
//                         formData.modalAudioUrl = 'null'
//                     }
//                 }
                
                // Check if formData._id exists in audioCache
                // const audioIndex = audioCache.findIndex(item => item._id === formData._id);
                
                // // If formData._id exists in audioCache, update modalAudioUrl
                // if (audioIndex !== -1) {
                    // formData.modalAudioUrl = audioCache[audioIndex].audioUrl;
                // }
                
                // Update formData in indexedDB
//                 await formDataStore.put(formData);
//                 console.log(formData);
//             }
//         }

//         // Close the database connection
//         await db.close();
//     } catch (error) {
//         console.error('Error clearing IndexedDB fields:', error);
//     }
// };







    const fetchCounts = async () => {
        try {
            // Fetch count from IndexedDB
            const indexedDBData = await fetchDataFromIndexedDB();
            setIndexedDBCount(indexedDBData.length);
    
            if (navigator.onLine) {
                // Fetch count from MongoDB
                const mongoDBResponse = await axios.get('https://pl-api.iiit.ac.in/rcts/phcp2/api/get-mongodb-count');
    
                if (mongoDBResponse.status === 200) {
                    setMongoDBCount(mongoDBResponse.data.mongoDBCount);
    
                    // Calculate the count of records to be synced
                    // const syncCount = calculateSyncCount(mongoDBResponse.data.mongoDBCount, indexedDBData.length);
                    setSyncCount(0);
                } else {
                    // Handle error if status code is not 200
                    console.error('Failed to fetch MongoDB count:', mongoDBResponse.statusText);
                }
            } else {
                // Fetch count from IndexedDB and calculate sync count based on last sync timestamp
                console.log('Fetching count from IndexedDB and calculating sync count based on last sync timestamp');
    
                // Retrieve the last synchronized timestamp from session storage
                const lastSyncTimestamp = sessionStorage.getItem('lastSynchronizedTimestamp');
    
                if (!lastSyncTimestamp) {
                    console.log('No last sync timestamp found.');
                    return;
                }
    
                // Convert lastSyncTimestamp to a Date object
                const lastSyncDate = new Date(parseInt(lastSyncTimestamp, 10)); // Convert to integer before passing to Date
    
                // Get offline data since the last synchronized timestamp
                const filteredData = await getOfflineDataSince(lastSyncDate);
    
                // Count records with a timestamp greater than lastSyncTimestamp
                const recordsToSyncCount = filteredData.filter(entry => new Date(entry.timestamp) > lastSyncDate).length;
    
                // Log the count of records to be synced
                console.log('Number of records to sync:', recordsToSyncCount);
    
                // Set MongoDB count to 0 as it's not available offline
                setMongoDBCount(0);
    
                // Set the sync count to the number of records to sync
                setSyncCount(recordsToSyncCount);
            }
        } catch (error) {
            console.error('Error fetching counts:', error);
        }
    };
    
    // Function to calculate the count of records to be synced
    // const calculateSyncCount = (mongoDBCount, indexedDBCount) => {
    //     // Your logic to calculate sync count, for example:
    //     return Math.max(mongoDBCount, indexedDBCount) - Math.min(mongoDBCount, indexedDBCount);
    // };
    
    // Function to handle details button click
    const handleDetailsButtonClick = async () => {
        // Fetch counts and open the modal
        await fetchCounts();
        setDetailsModalVisible(true);
    };
    
    
    const synchronizeOfflineData = async (data) => {
        try {
            // Check if data is iterable
            if (data && typeof data[Symbol.iterator] === 'function') {
                // Synchronize offline data with MongoDB
                for (const formData of data) {
                    // Convert image URL and audio URL from base64 to MinIO URLs
                    // console.log(formData.imageUrl)
                    // console.log(formData.modalAudioUrl)
                    console.log(data)
                    if (formData.imageUrl && formData.modalAudioUrl) {
                        // Assuming formData.imageUrl and formData.audioUrl are base64 strings
                        const imageFileName = `image_${Date.now()}.png`;
                        const audioFileName = `audio_${Date.now()}.wav`;
                        
                        // Decode base64 data to binary data
                        const imageData = base64ToBinary(formData.imageUrl.split(',')[1]);
                        const audioData = base64ToBinary(formData.modalAudioUrl.split(',')[1]);
                        // Upload image and audio to MinIO
                        const imageMinioUrl = await minioUploader(imageData, imageFileName, 'image/png');
                        const audioMinioUrl = await minioUploader(audioData, audioFileName, 'audio/wav');
                    
                        // Update formData with MinIO URLs
                        formData.imageUrl = imageMinioUrl;
                        formData.modalAudioUrl = audioMinioUrl;
                    
                        // Post formData to MongoDB
                        await postDataToMongoDB(formData);
                        updateIndexedDB(formData._id, imageMinioUrl, audioMinioUrl);
                        // console.log(formData.id)
                        // console.log(formData._id)
                      
                    }
                    
                }
                console.log('Offline data synchronized successfully.');
            } else {
                console.log('No offline data to synchronize.');
            }
        } catch (error) {
            console.error('Error synchronizing offline data:', error);
        }
    };
  // Assuming formData.id contains the correct id value


  // Assuming formData.id contains the correct id value
const updateIndexedDB = async (id, imageUrl, modalAudioUrl) => {
    try {
        // Open IndexedDB database
        const db = await idb.openDB('formDataDB', /*version=*/ 1);

        // Access the object store
        const tx = db.transaction('formDataStore', 'readwrite');
        const store = tx.objectStore('formDataStore');
        console.log(store)

        // Fetch the record with the given id
        const record = await store.get(id);
        console.log(record)

        // Update the fields
        if (record) {
            record.imageUrl = imageUrl;
            record.modalAudioUrl = modalAudioUrl;

            // Put the updated record back into the object store
            await store.put(record);
            console.log(`Record with id ${id} updated successfully.`);
        } else {
            console.log(`Record with id ${id} not found.`);
        }

        // Close the transaction and database connection
        await tx.done;
        db.close();
    } catch (error) {
        console.error('Error updating record:', error);
    }
};

function base64ToBinary(base64String) {
        const byteCharacters = atob(base64String);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        return new Uint8Array(byteNumbers);
    }
    
    
    const postDataToMongoDB = async (data) => {
        try {
            // Add timestamp to the data
            const timestampedData = { timestamp: new Date(), ...data };
    
            const response = await axios.post('https://pl-api.iiit.ac.in/rcts/phcp2/api/save-data', timestampedData);
            if (response.status === 200) {
                console.log('Form data submitted to MongoDB successfully!');
            } else {
                console.error('Failed to submit form data to MongoDB.');
            }
        } catch (error) {
            console.error('Error posting data to MongoDB:', error);
        }
    };
    
 const fetchDataFromIndexedDB = async (searchInput) => {
    try {
        // Open IndexedDB database
        const db = await openDB('formDataDB', 1, {
            upgrade(db) {
                // Create an object store if not exists
                const formDataStore = db.createObjectStore('formDataStore', { keyPath: '_id', autoIncrement: true });
            },
        });

        // Fetch all records if no search input is provided
        const allData = await db.getAll('formDataStore');

        if (!searchInput) {
            console.log('All form data retrieved from IndexedDB:', allData);
            return allData;
        }

        // Filter records based on the location
        const filteredData = allData.filter(entry => entry.data && (entry.data.location === searchInput || entry.location === searchInput));

        console.log('Filtered form data retrieved from IndexedDB:', filteredData);
        return filteredData;
    } catch (error) {
        console.error('Error fetching data from IndexedDB:', error);
        return [];
    }
};
    

    const handleCreate = (label) => {
        console.log("Create", label);
        switch (String(label).toLowerCase()) {
            case "drive":
                setCreateDrivePopup(true);
                break;
            case "form":
                setCreateFormPopup(true);
                break;
        
            default:
                console.log("Invalid label");
                break;
        }
    }

    const onCreateFormHandler = () => {
        console.log("here");
        setCreateDrivePopup(false);
        CreateFormPopup(true);
    }

    const handleUsernameClick = (item) => {
        setSelectedItem(item);
        setModalVisible(true);
        // setPopupVisible(true);
    };
    
     const handleSearch = async () => {
    console.log('search');
    try {
        const searchLocation = searchInput.toLowerCase(); // Convert to lowercase
        console.log('Location:', searchLocation);
        const indexedDBData = await fetchDataFromIndexedDB(searchLocation);
        setFormData(prevState => ({
            ...prevState,
            listItems: indexedDBData
        }));
    } catch (error) {
        console.error('Error searching data:', error);
    }
};
     const handleImportToIndexedDB = async () => {
    try {
        // Fetch data only if there are list items displayed
        if (formData.listItems.length > 0) {
            // Open or create IndexedDB database
            const db = await openDB('formDataDB', 1, {
                upgrade(db) {
                    // Create an object store if not exists
                    const formDataStore = db.createObjectStore('formDataStore', { keyPath: '_id', autoIncrement: true });
                },
            });

            // Open a transaction and get the object store
            const tx = db.transaction('formDataStore', 'readwrite');
            const store = tx.objectStore('formDataStore');

            // Clear existing data and add new data
            await store.clear();
            for (const record of formData.listItems) {                
                
                await store.add({ _id: record._id, data: record.data || record });
                console.log(record);
                console.log(record.data)
            }

            console.log('Data imported into IndexedDB');
        } else {
            console.log('No data to import into IndexedDB');
        }
    } catch (error) {
        console.error('Error importing data to IndexedDB:', error);
    }
};
 


       const handleClearIndexedDB = async () => {
        try {
            const db = await openDB('formDataDB', 1);
            const tx = db.transaction('formDataStore', 'readwrite');
            const store = tx.objectStore('formDataStore');
    
            // Clear existing data in the object store
            await store.clear();
    
            console.log('IndexedDB data cleared');
        } catch (error) {
            console.error('Error clearing IndexedDB data:', error);
        }
    };

    
    
    const listTemplate = (listItems) => {
        return (
            <div>
                <div className={styles.listSection}>
                    <div className={styles.title}>{translations["Existing Forms"]}</div>
                    <div className={styles.list}>
                        {listItems.length === 0 && <div style={{ padding: '15px' }}>No records found</div>}
                        {listItems.length > 0 && listItems.map((item, idx) => (
                            <div className={styles.item} key={idx}>
                                <div className={styles.info}>
                                    <div className={styles.name} onClick={() => handleUsernameClick(item)}>
    {translations["Username"]}: {item.data ? item.data.username : item.username}
</div>
                                    {/* Additional details about the item */}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div onClick={() => handleDetailsButtonClick()}>{translations["Show Details"]}</div> {/* Button to show details modal */}
                    {detailsModalVisible && <DetailsModal />} {/* Render the details modal if detailsModalVisible is true */}
                </div>
                 <Button variant="contained" color="primary" onClick={handleImportToIndexedDB}>
        {translations["Import to IndexedDB"]}
      </Button>
      <Button variant="contained" color="secondary" onClick={handleClearIndexedDB}>
      {translations["Clear IndexedDB"]}
    </Button>
    
                <div>
                    <label htmlFor="numToCache">{translations["Number of Records to Cache"]}   :</label>
                    <input
                        type="number"
                        id="numToCache"
                        name="numToCache"
                        value={numRecords}
                        onChange={handleNumToCacheChange}
                    />
                    <button onClick={() => fetchData(numRecords)}>{translations["Fetch Data"]}</button>
                </div>
            </div>
        );
    };

    const DetailsModal = () => (
        <Modal
            title="Details"
            visible={detailsModalVisible}
            onCancel={() => setDetailsModalVisible(false)}
            footer={null}
        >
            <p>MongoDB Count: {mongoDBCount}</p>
            <p>IndexedDB Count: {indexedDBCount}</p>
            <p>Records to Sync: {syncCount}</p>
        </Modal>
    );
    
    console.log(formData.listItems)


    
    
    

const ModalComponent = ({ item, onClose, visible }) => {
    console.log('modalcompo');
    const hasData = item.data !== undefined;
    const hasImageAndAudio = item.imageUrl && item.modalAudioUrl;
    const hasImageAndAudiodata = item.data && item.data.imageUrl && item.data.modalAudioUrl;
    

    const [imageError, setImageError] = useState(false);
    const [audioError, setAudioError] = useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    const handleAudioError = () => {
        setAudioError(true);
    };

    return (
        <Modal
            visible={visible}
            onCancel={onClose}
            footer={null}
        >
            <div>
                <span className="close" onClick={onClose}>&times;</span>
                <div>{translations["Username"]}: {hasData ? item.data.username : item.username}</div>
                <div>{translations["Input Number"]}: {hasData ? item.data.inputNumber : item.inputNumber}</div>
                <div>{translations["Gender"]}: {hasData ? item.data.gender : item.gender}</div>
                <div>{translations["Location"]}: {hasData ? item.data.location : item.location}</div>

                {((hasImageAndAudio || hasImageAndAudiodata) && (
                    <>
                        {(hasData ? item.data.imageUrl && item.data.modalAudioUrl : item.imageUrl && item.modalAudioUrl) ? (
                            <>
                                {(imageError || audioError) ? (
                                    <p>No internet connection. Image and audio cannot be displayed.</p>
                                ) : (
                                    <>
                                        <img src={hasData ? item.data.imageUrl : item.imageUrl} alt="Form Image" style={{ width: '100%' }} onError={handleImageError} />
                                        <audio controls onError={handleAudioError}>
                                            <source src={hasData ? item.data.modalAudioUrl : item.modalAudioUrl} type="audio/mpeg" />
                                            Your browser does not support the audio element.
                                        </audio>
                                    </>
                                )}
                            </>
                        ) : (
                            <p>No internet connection. Image and audio cannot be displayed.</p>
                        )}
                    </>
                )) || (
                    <div>
                        {!item.imageUrl && (
                            <div>
                                <p>{translations["Add Image"]}</p>
                                <FileAddOutlined />
                            </div>
                        )}
                        {!item.modalAudioUrl && (
                            <div>
                                <p>{translations["Add Audio"]}</p>
                                <FileAddOutlined />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};

    
    return (
        <>
            {/* <h1>DrivesForms</h1> */}
            {createDrivePopup && <CreateDrivePopup onCreateFormClick={onCreateFormHandler} onClose={()=>{setCreateDrivePopup(false); dispatch(fetchAllDrives())}} />}
            {createFormPopup && <CreateFormPopup onClose={()=>{setCreateFormPopup(false); dispatch(fetchAllForms())}} />}
            {/* {popupVisible && <DriveInfoPopup onClose={()=>{setPopupVisible(false)}} />} */}
            { selectedItem && (
                <ModalComponent
                    item={selectedItem}
                   
                onClose={() => setModalVisible(false)}
                visible={modalVisible}
                    // onClose={() => setPopupVisible(false)}
                />
            )}
            <div className={styles.container}>
                <div className={styles.actionButtonGrp}>
                    {["drive", "form"].map((label, idx) => (
                        <div className={styles.actionBtn} key={idx} onClick={()=>{handleCreate(label)}}>
                            <i className="pi pi-plus"></i>
                            <img src="https://pl-app.iiit.ac.in/rcts/phcp/assets/icons/common/createform.svg" alt="create form" />

<div className={styles.label}>{translations["CREATE"]} {translations[label.toUpperCase()]}</div>

                        </div>
                    ))}
                </div>
                <div className={styles.searchBar}>
                    <input 
                        type="text" 
                        value={searchInput} 
                         onChange={(e) => setSearchInput(e.target.value)} // Attach handleChange event handler
                    />
                    <div className={styles.searchIcon} onClick={handleSearch}> {/* Attach handleSearch event handler */}
                        <i className="pi pi-search"></i>
                    </div>
                </div>                <div className={styles.table}>
                    {/* {driveData && listTemplate(driveData)} */}
                    {formData && listTemplate(formData.listItems)}
                </div>
            </div>
        </>
    );
}

export default DrivesForms; 
