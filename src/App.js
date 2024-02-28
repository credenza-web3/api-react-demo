import { WithoutSdk } from './components/without-sdk'
import { WithSdk } from './components/with-sdk'


function App() {
  return (
    <div className="App">
      <WithoutSdk />
      <br />
      <WithSdk />
    </div>
  );
}

export default App;
