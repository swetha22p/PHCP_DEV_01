import React, { useEffect } from 'react';

const Logout = ({ handleLogout }) => {
  // useEffect to trigger handleLogout when component mounts
  useEffect(() => {
    handleLogout();
  }, [handleLogout]); // Dependency array ensures handleLogout is only called once on mount

  // This component doesn't need to render anything, so you can return null
  return null;
};

export default Logout;
