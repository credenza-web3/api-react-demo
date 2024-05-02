import { WithoutSdk } from './components/without-sdk'
import { WithSdk } from './components/with-sdk'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { WithPassport } from './components//with-passport'
import { HomePage } from './components/home-page'


function App() {
  const location = useLocation();

  return (
    <>
      <header>
        {location.pathname !== '/' && (<Link to="/">Home Page</Link>)}
        {location.pathname !== '/with-sdk' && (<Link to="/with-sdk">With Sdk</Link>)}
        {location.pathname !== '/without-sdk' && (<Link to="/without-sdk">Without Sdk</Link>)}
        {location.pathname !== '/with-passport' && (<Link to="/with-passport">With Passport</Link>)}
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/with-sdk" element={<WithSdk />} />
        <Route path="/without-sdk" element={<WithoutSdk />} />
        <Route path="/with-passport" element={<WithPassport />} />
        <Route path="*" element={<HomePage />} />

      </Routes >

    </>
  );
}

export default App;
