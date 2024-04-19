import { Passport } from "@credenza3/passport-evm";
import { useEffect } from 'react'
import { Link } from 'react-router-dom';


let passport;

// const spicyChainConfig = {
//   chainId: '0x15b32',
//   rpcUrl: 'https://chiliz-spicy.publicnode.com',
//   displayName: 'Spicy',
//   blockExplorer: 'https://spicy-explorer.chiliz.com/',
//   nativeCurrency: {
//     name: 'CHZ',
//     symbol: 'CHZ',
//     decimals: 18,
//   },
// }

const initPassport = async () => {
  passport = new Passport({
    chainId: '88882',
    clientId: "65ae84e382b59c55c07cb5d9",
    config: {
      content: {
        cloak: true,
      },
      auth: {
        extendedRegistration: true,
      },
      nav: {
        theme: Passport.themes.WHITE,
        direction: Passport.navDirections.TOP,
      },
    },
  });
  await passport.init();
  passport.showNavigation(
    { bottom: "0", right: "0" },
    {
      minimization: {
        toggler: {
          enabled: true,
        },
      },
    }
  );
};

export function WithPassport() {
  // const [suiAddress, setSuiAddress] = useState()
  // const [evmAddress, setEvmAddress] = useState()
  // const [pointsLoyaltyContract, setLoyaltyContractPoints] = useState()
  // const [membership, setMembership] = useState()

  useEffect(() => {
    const passportPromise = initPassport()
    const unsubscribe = passport.on('LOGIN', async function () {
      await passportPromise
      console.log('passport', passport)
    })
    return () => unsubscribe()
  }, [])

  // const sdk = passport.initCredenzaSDK()
  // console.log(sdk)
  
  
  return (
    <Link to="/">
    <div>
      <div>With Passport:</div>
      {console.log('passport', passport)}
      <button onClick={() => { }}>Authorize with Credenza</button>
      {/* {evmAddress && <div>Evm Address: {evmAddress}</div>}
      {suiAddress && <div>Sui Address: {suiAddress}</div>}
      {pointsLoyaltyContract && <div>Loyalty Contract Points: {pointsLoyaltyContract}</div>}
      {membership && <div>Membership: {membership}</div>}
      <br />
      {evmAddress && <button onClick={addLoyaltyContractPoints}>Add points to a loyalty contract</button>} */}
      <br />
    </div>
    </Link>
  );
}