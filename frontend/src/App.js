import React from 'react';
import { AuthProvider } from './context/AuthContext';
import PyrusApp from './components/PyrusApp';

function App() {
  return (
    <AuthProvider>
      <PyrusApp />
    </AuthProvider>
  );
}

export default App;
