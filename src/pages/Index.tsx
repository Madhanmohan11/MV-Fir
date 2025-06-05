
import React from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Redirect to home page since routing is now handled in App.tsx
  return <Navigate to="/" replace />
  
  
  ;
};

export default Index;
