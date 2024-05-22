import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell , RadialBarChart, RadialBar, Legend ,LineChart, Line} from 'recharts';
import styles from "./Dashboard.module.scss";
import { openDB } from 'idb';
import useTranslations from "../../Translations/useTranslations";
import { MapContainer, TileLayer, Marker, Popup , Polygon, Circle} from 'react-leaflet';
import L from "leaflet";
import pin from "../../maps/maps.png"
// import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import DatamapsIndia from "react-datamaps-india";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [genderData, setGenderData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0); // Add a state for refresh key
  const [bothURLCount, setBothURLCount] = useState(0);
  const [imageURLCount, setImageURLCount] = useState(0);
  const [audioURLCount, setAudioURLCount] = useState(0);
  const [noURLCount, setNoURLCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [recordsCount, setRecordsCount] = useState(0);
  const [filteredRecordsCount, setFilteredRecordsCount] = useState(0);
  const translations = useTranslations();
  const [hourlyData, setHourlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData , setMonthlyData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [view, setView] = useState('hourly');


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (navigator.onLine) {
        // Online: Fetch data from API
        const response = await axios.get('https:/pl-api.iiit.ac.in/rcts/phcp2/api/get-data');
        setData(response.data);
        calculateLocationPercentage(response.data);
        calculateGenderPercentage(response.data);
        calculateURLCounts(response.data);
        setRecordsCount(response.data.length);
        // Increment the refresh key to force PieChart rotation
        setRefreshKey(prevKey => prevKey + 1);
      } else {
        // Offline: Fetch data from IndexedDB
        const db = await openDB('formDataDB', 1);
        const tx = db.transaction('formDataStore', 'readonly');
        const store = tx.objectStore('formDataStore');
        const cursor = await store.openCursor();
        const offlineData = [];
  
        if (cursor) {
          do {
            offlineData.push(cursor.value.data);
          } while (await cursor.continue());
        }
  
        setData(offlineData);
        console.log(offlineData)
        calculateLocationPercentage(offlineData);
        calculateGenderPercentage(offlineData);
        calculateURLCounts(offlineData);
        setRecordsCount(offlineData.length);
        // No need to increment refresh key here since we're not updating real-time data
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  

  const calculateLocationPercentage = async (data) => {
    try {
      const locationCoordinates = [];
      const uniqueCities = [...new Set(data.map(entry => entry.location))]; // Get unique city names
  
      for (const city of uniqueCities) {
        const { cityName, lat, lng, boundingBox } = await getCityCoordinates(city);
        const count = data.filter(entry => entry.location === city).length;
        console.log(count)
        locationCoordinates.push({ locationName: cityName, count , lat, lng, boundingBox });
      }
      setLocationData(locationCoordinates);
      console.log(locationCoordinates);
  
    } catch (error) {
      console.error('Error calculating location coordinates:', error);
    }
  };
  
  const getCityCoordinates = async (cityName) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`);
      const results = response.data;
      console.log({ results });
      if (results.length > 0) {
        const { lat, lon, boundingbox } = results[0];
      return { cityName, lat, lng: lon, boundingBox: boundingbox };
      } else {
        throw new Error(`No results found for ${cityName}`);
      }
    } catch (error) {
      console.error('Error fetching coordinates for city:', error);
      return { cityName, lat: 0, lng: 0 }; // Fallback coordinates
    }
  };
    
  

  const calculateGenderPercentage = (data) => {
    try {
      const genderCounts = {
        male: 0,
        female: 0,
        other: 0
      };
  
      data.forEach(entry => {
        // Check if the entry has a gender property and it's not undefined
        if (entry && entry.gender !== undefined) {
          const gender = entry.gender.toLowerCase();
          if (gender === 'male') {
            genderCounts.male++;
          } else if (gender === 'female') {
            genderCounts.female++;
          } else {
            genderCounts.other++;
          }
        }
      });
  
      const totalCount = data.length;
      const calculatedGenderData = Object.entries(genderCounts).map(([gender, count]) => ({
        name: gender,
        value: (count / totalCount) * 100
      }));
      setGenderData(calculatedGenderData);
    } catch (error) {
      console.error('Error calculating gender percentage:', error);
    }
  };
  

  const calculateURLCounts = (data) => {
    try {
      let bothURLCount = 0;
      let imageURLCount = 0;
      let audioURLCount = 0;
      let noURLCount = 0;
  
      data.forEach(entry => {
        // Check if the entry has imageUrl and modalAudioUrl properties and they're not undefined
        if (entry && entry.imageUrl !== undefined && entry.modalAudioUrl !== undefined) {
          if (entry.imageUrl && entry.modalAudioUrl) {
            bothURLCount++;
          } else if (entry.imageUrl) {
            imageURLCount++;
          } else if (entry.modalAudioUrl) {
            audioURLCount++;
          } else {
            noURLCount++;
          }
        }
      });
  
      setBothURLCount(bothURLCount);
      setImageURLCount(imageURLCount);
      setAudioURLCount(audioURLCount);
      setNoURLCount(noURLCount);
    } catch (error) {
      console.error('Error calculating URL counts:', error);
    }
  };
  
  const dataForBlocks = [
    { name: 'Image, Audio URLs', value: bothURLCount || 0, fill: '#000000' },
    { name: 'Only Image URLs', value: imageURLCount || 0, fill: '#bcbcbc' },
    { name: 'Only Audio URLs', value: audioURLCount || 0, fill: '#ffc658' },
    { name: 'No URLs', value: noURLCount || 0, fill: '#ff6b6b' }
  ];
  
  const handleDateChange = (event) => {
    const selectedDate = event.target.value;
    setSelectedDate(selectedDate);
    filterData(selectedDate);
    setView('hourly')
  };
  
  const filterData = (selectedDate,startDate,endDate) => {
    // if (!selectedDate) {
    //   setHourlyData([]);
    //   return;
    // }
  
    let filteredData;
  
    if (!startDate || !endDate) {
      filteredData = data.filter(entry => {
        // Check if entry exists and has a timestamp property
        return entry && entry.timestamp && new Date(entry.timestamp).toISOString().split('T')[0] === selectedDate;
      });
    } else {
      
      filteredData = data.filter(entry => {
        // Check if entry exists and has a timestamp property
        return entry && entry.timestamp && new Date(entry.timestamp).toISOString().split('T')[0] >= startDate && new Date(entry.timestamp).toISOString().split('T')[0] <= endDate;
      });
      console.log(filteredData);
    }

    // Assuming you want to calculate data for the current month
const currentDate = new Date(); // Get the current date
const year = currentDate.getFullYear(); // Get the current year
const month = currentDate.getMonth(); // Get the current month (0-indexed)

// Get the number of days in the month
const daysInMonth = new Date(year, month + 1, 0).getDate();

// Initialize an array to store daily data for the month
const monthlyData = Array.from({ length: daysInMonth }, () => ({ dayOfMonth: 0, records: 0 }));

// Iterate over the filtered data
filteredData.forEach(entry => {
  const dayOfMonth = new Date(entry.timestamp).getDate(); // Get the day of the month
  monthlyData[dayOfMonth - 1].dayOfMonth = dayOfMonth; // Adjust to 0-based index
  monthlyData[dayOfMonth - 1].records++; // Increment records for the corresponding day
});

// Update state with monthly data
console.log(monthlyData);
setMonthlyData(monthlyData);


    
    const weeklyData = Array.from({ length: 7 }, () => ({ dayOfWeek: 0, records: 0 }));
filteredData.forEach(entry => {
  const dayOfWeek = new Date(entry.timestamp).getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
  weeklyData[dayOfWeek].dayOfWeek = dayOfWeek;
  weeklyData[dayOfWeek].records++;
});

// Update state with weekly data
console.log(weeklyData);
setWeeklyData(weeklyData);
    

    
  
    // Aggregate data by hour
    const hourlyData = Array.from({ length: 24 }, () => ({ hour: 0, records: 0 }));
    filteredData.forEach(entry => {
      const hour = new Date(entry.timestamp).getHours();
      hourlyData[hour].hour = hour;
      hourlyData[hour].records++;
    });
  
    // Update state with hourly data
    console.log(hourlyData)
    setHourlyData(hourlyData);
  };

  

  
  
  const handleWeekData = () => {
    const today = new Date();
    const weekStartDate = new Date(today);
    const weekEndDate = new Date(today);
    const startDay = weekStartDate.getDate() - weekStartDate.getDay() + (weekStartDate.getDay() === 0 ? -6 : 1); // Get start date of the week (Sunday)
    weekStartDate.setDate(startDay);
    weekEndDate.setDate(startDay + 6); // End date of the week (Saturday)
    
    const formattedWeekStartDate = weekStartDate.toISOString().split('T')[0];
    const formattedWeekEndDate = weekEndDate.toISOString().split('T')[0];
    
    filterData(null, formattedWeekStartDate, formattedWeekEndDate);
    setView('weekly');
  };
  
  
  const handleMonthData = () => {
    const today = new Date();
    
    // Start date: Same day of the previous month
    const lastMonthStartDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    // End date: Today's date
    const currentMonthEndDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
    const formattedLastMonthStartDate = lastMonthStartDate.toISOString().split('T')[0];
    const formattedCurrentMonthEndDate = currentMonthEndDate.toISOString().split('T')[0];
    
    // setSelectedDate({ startDate: formattedLastMonthStartDate, endDate: formattedCurrentMonthEndDate });
    filterData(formattedLastMonthStartDate, formattedLastMonthStartDate, formattedCurrentMonthEndDate);
    setView('monthly');
};


  
  // const handleDrive = () => {

  // };

  const handleAssistants = async () => {
    try {
      if (navigator.onLine) {
        // Online: Fetch data from API
        const response = await axios.get('http://127.0.0.1:5401/api/medicalassistants');
        // Handle the fetched data as needed
        console.log(response.data); // For example, log the response data
        calculateLocationPercentage(response.data);

      } else {
        console.log("You are currently offline. Unable to fetch data.");
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  const handleDriveData = async() => {
    window.location.reload()
  }
  
 
  

  const handleMarkerClick = (location) => {
    // Set the selected location when a marker is clicked
    setSelectedLocation(location);
  };

  // let mapCenter = { lat: 0, lng: 0 };
  // let mapZoom = 3;
  // if (locationData.length > 0) {
  //   mapCenter = { lat: parseFloat(locationData[0].lat), lng: parseFloat(locationData[0].lng) };
  //   mapZoom = 11; // Adjust zoom level as needed
  // }





  const MapMarker = ({ point, name, icon , count}) => {
    console.log(name);
    
    return (
        <Marker position={point} icon={icon}>
            <Popup>
            <strong>{name}</strong>
            <br />
            Medical drive is happening here with a count of {count}.
          </Popup>
        </Marker>
    );
};


const calculateCircleRadius = (count) => {
  // Define your criteria for calculating circle radius here
  // Example: Increase radius based on count value
  console.log(count);
  const baseRadius = 1000; // Base circle radius
  const maxRadius = 10000; // Maximum circle radius
  const newRadius = Math.min(baseRadius + count * 100, maxRadius); // Adjust radius based on count value
  return newRadius; // Return the calculated radius
};


const defaultCircle = L.circleMarker([0, 0], {
  radius: 5,
  color: '#3388ff',
  fillColor: '#3388ff',
  fillOpacity: 1,
});

 
  
  

  return (
    <div className={styles.dashboard}>
      <div className={styles.chartContainer}>
        <div className={styles.chart} style={{ flex: '1', marginTop: '10px' }}>
        <button onClick={handleDriveData}>Drive Data</button>
        <button onClick={handleAssistants}>Assistants Data</button>
        <MapContainer
    // center={[20.5937, 78.9629]} // Centered on India
    center={[17.1232, 79.2088]}
    // center={[15.9129,79.7400]}
    zoom={7} // Zoom level adjusted as needed
    style={{ height: "70vh", width: "70%" }}
>
    <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    />
   
   {locationData.map((location, index) => (
    <Circle
        key={`${location.locationName}-${index}`}
        center={[parseFloat(location.lat), parseFloat(location.lng)]}
        fillColor="#8a2be2"
        color="black" 
        fillOpacity={0.5}
        radius={calculateCircleRadius(location.count)} // Calculate circle radius based on count value
    >
        <Popup>
            <strong>{location.locationName}</strong>
            <br />
            Medical drive is happening here with a count of {location.count}.
        </Popup>
    </Circle>
))}

         
      
      {/* Display the bounding box region */}
      {/* {locationData.map((location, index) => (
        <Polygon
          key={`bbox-${index}`}
          positions={[
            [parseFloat(location.boundingBox[0]), parseFloat(location.boundingBox[2])],
            [parseFloat(location.boundingBox[1]), parseFloat(location.boundingBox[2])],
            [parseFloat(location.boundingBox[1]), parseFloat(location.boundingBox[3])],
            [parseFloat(location.boundingBox[0]), parseFloat(location.boundingBox[3])],
          ]}
          pathOptions={{ color: 'gray', fillOpacity: 0.8 }}
        />
      ))} */}
    </MapContainer>


      <center><h2>{translations["Location Data"]}</h2></center>
    </div>
        <div className={styles.chart} style={{ flex: '1', marginTop: '40px' }}>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart key={refreshKey}>
              <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#000000' : '#bcbcbc'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <center><h2>{translations["Gender Distribution"]}</h2></center>
        </div>
      </div>
      <div className={styles.chartContainer}>
  <div className={styles.chart} style={{ flex: '1' ,marginTop: '120px' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      {dataForBlocks.map((block, index) => (
        <div key={index} style={{ textAlign: 'right', marginBottom: '10px', width: '200px', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: block.fill, marginRight: '5px' }}></div>
          <div>{block.name}</div>
          <div>{block.value}</div>
        </div>
      ))}
    </div>
    <center>
      <h2>{translations["Records Count"]}</h2>
    </center>
  </div>


  <div className={styles.chart} style={{ flex: '1' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <h2>{translations["Select date:"]}</h2>
         
        </div>
        <button onClick={handleWeekData}>Week Data</button>
        <button onClick={handleMonthData}>Month Data</button>
        <input type="date" onChange={handleDateChange} />
        <ResponsiveContainer width="100%" height={400}>
        <BarChart key={refreshKey} data={view === 'hourly' ? hourlyData : view === 'monthly' ? monthlyData : weeklyData}>
          <XAxis dataKey={view === 'hourly' ? 'hour' : view === 'monthly' ? 'dayOfMonth' : 'dayOfWeek'} />
          <Bar dataKey="records" fill="#8884d8" />
          <Tooltip />
          <Legend />
        </BarChart>
      </ResponsiveContainer>
        <center><h2>{translations["Records on Selected Date:"]} {selectedDate}</h2></center>
  </div>
      </div>
    </div>
  );
}
export default Dashboard;  