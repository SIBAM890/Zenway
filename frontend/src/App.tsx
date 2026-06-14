import { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import OpsDashboard from './pages/OpsDashboard';
import AppShell from './layouts/AppShell';
import { GlobalProvider } from './context/GlobalContext';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('pushstate-changed', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('pushstate-changed', handleLocationChange);
    };
  }, []);

  let content;
  if (currentPath === '/dashboard') {
    content = <AppShell><Dashboard /></AppShell>;
  } else if (currentPath === '/ops-dashboard') {
    content = <AppShell><OpsDashboard /></AppShell>;
  } else {
    content = <Landing />;
  }

  return <GlobalProvider>{content}</GlobalProvider>;
}

export default App;
