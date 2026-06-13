import { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import OpsDashboard from './pages/OpsDashboard';
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
    content = <Dashboard />;
  } else if (currentPath === '/ops-dashboard') {
    content = <OpsDashboard />;
  } else {
    content = <Landing />;
  }

  return <GlobalProvider>{content}</GlobalProvider>;
}

export default App;
