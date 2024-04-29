import { Passport } from "@credenza3/passport-evm";
import { useEffect } from 'react'

let passport = new Passport({
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
  const passportPromise = passport.init()
  passport.on('LOGIN', async function () {
    await passportPromise
  })

  await passportPromise;
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
  console.log('passport', passport)
};

export function WithPassport() {
  // const [suiAddress, setSuiAddress] = useState()
  // const [evmAddress, setEvmAddress] = useState()
  // const [pointsLoyaltyContract, setLoyaltyContractPoints] = useState()
  // const [membership, setMembership] = useState()

  useEffect(() => {
    initPassport()
  }, [])


  return (
    <div>
      <div>With Passport:</div>
      <br />
    </div>
  );
}
