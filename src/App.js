import { WithoutSdk } from './components/without-sdk'
import { WithSdk } from './components/with-sdk'
import { Routes, Route, Link, useLocation } from 'react-router-dom'



function App() {
  const location = useLocation();

  return (
    <>
      <header>
        {location.pathname !== '/with-sdk' && (<Link to="/with-sdk">with-sdk</Link>)}
        {location.pathname !== '/without-sdk' && (<Link to="/without-sdk">without-sdk</Link>)}
      </header>

      <Routes>
        <Route path="/with-sdk" element={<WithSdk />} />
        <Route path="/without-sdk" element={<WithoutSdk />} />
      </Routes>

    </>
  );
}

export default App;
