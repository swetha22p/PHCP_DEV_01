import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import './App.css';

import Data from './components/Data/Data';
import Details from './components/Data/Details/Details';
import Overview from './components/Data/Overview/Overview';
import Assistants from './components/Groups/Assistants/Assistants';
import Groups from './components/Groups/Groups';
import MedicalAssistants from './components/Groups/MedicalAssistants/MedicalAssistants';
import Account from './components/Home/Account/Account';
import Dashboard from './components/Home/Dashboard/Dashboard';
import Home from './components/Home/Home';
import Loader from './components/Loader/Loader';
import Login from './components/Login/Login';
import DrivesForms from './components/Tools/DrivesForms/DrivesForms';
import ScreeningApis from './components/Tools/ScreeningApis/ScreeningApis';
import Tools from './components/Tools/Tools';
import MainLayout from './pages/MainLayout';
import Signup from './components/Signup/Signup';
import { Toast } from 'primereact/toast';
import { useDispatch, useSelector } from 'react-redux';
import { resetToast } from './store/features/toast/toastSlice';
import Test from './components/Tools/DrivesForms/Test';
import { useNavigate } from 'react-router-dom';
import map from './components/maps/testmap';
        

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const toastState = useSelector(state => state.toast);
  const toastRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    if(toastState.showToast)
      toastRef.current.show({ 
        severity: toastState.toastType, 
        summary: String(toastState.toastType).toUpperCase(), 
        detail: toastState.toastMessage });
  }, [toastState]);
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedRole = localStorage.getItem('user_role');

    if (storedToken && storedRole) {
      setUser({ token: storedToken, role: storedRole });
      setLoading(false);
    } else {
      setLoading(false);
      navigate('/login');
    }
  }, []);

  const handleLogin = async () => {
    // This function will be passed to the Login component
    // and invoked when the user clicks the login button
    // It should handle the login logic, similar to how it was implemented before
  };

  return (
    <>
      <Loader />
      <Toast ref={toastRef} onShow={()=>dispatch(resetToast())} life={500} />
      <Routes>
      {user ? (
        <>
        <Route path='login' element={<Login />} />
        <Route path='testmap' element={<map />} />
        <Route path='' element={<MainLayout />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path='home' element={<Home />}>
            <Route index element={<Navigate to="account" replace />} />
            <Route path='account' element={<Account />} />
            <Route path='dashboard' element={<Dashboard />} />
          </Route>
          <Route path='groups' element={<Groups />}>
            <Route index element={<Navigate to="assistants" replace />} />
            <Route path='assistants' element={<Assistants />} />
            <Route path='medical-assistants' element={<MedicalAssistants />} />
          </Route>
          <Route path='data' element={<Data />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path='overview' element={<Overview />} />
            <Route path='details' element={<Details />} />
          </Route>
          <Route path='tools' element={<Tools />}>
            <Route index element={<Navigate to="drives-forms" replace />} />
            <Route path='drives-forms' element={<DrivesForms />} />
            <Route path='screening-apis' element={<ScreeningApis />} />
          </Route>
          <Route path='new' element={<Test />} />
        </Route>
         </>
        ) : (
          <>
             <Route path="/" element={<Login onLogin={handleLogin} />} />
              <Route path="login" element={<Login onLogin={handleLogin} />} />
              <Route path="signup" element={<Signup />} />
          </>
        )}
      </Routes>
    </>
  );
}

export default App;
