import { useState, useEffect } from 'react'

import { CredenzaSDK } from '@credenza3/core-web'
import { OAuthExtension } from '@credenza3/core-web-oauth-ext'
import { AccountExtension } from '@credenza3/core-web-account-ext'
import { EvmExtension } from '@credenza3/core-web-evm-ext'
import { SuiExtension } from '@credenza3/core-web-sui-ext'

const mumbaiChainConfig = {
  chainId: '0x13881',
  rpcUrl: 'https://polygon-mumbai-bor.publicnode.com',
  displayName: 'Mumbai',
  blockExplorer: 'https://mumbai.polygonscan.com/',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
}

const sdk = new CredenzaSDK({
  clientId: process.env.REACT_APP_CREDENZA_CLIENT_ID,
  env: 'staging', // remove for prod
  extensions: [
    new SuiExtension({ suiNetwork: SuiExtension.SUI_NETWORK.DEVNET }),
    new EvmExtension({ chainConfig: mumbaiChainConfig }),
    new OAuthExtension(),
    new AccountExtension(),
  ],
})

export function WithSdk() {
  const [email, setEmail] = useState('')
  const [isCredenzaLoggedIn, setIsCredenzaLoggedIn] = useState(false)
  const [suiAddress, setSuiAddress] = useState()
  const [evmAddress, setEvmAddress] = useState()

  function credenzaAuthorize () {
    sdk.oauth.login({
      scope: 'profile.write blockchain.evm blockchain.sui',
      redirectUrl: window.location.origin + '/with-sdk',
      type: OAuthExtension.LOGIN_TYPE.PASSWORDLESS,
      passwordlessType: OAuthExtension.PASSWORDLESS_LOGIN_TYPE.EMAIL,
      ...(email ? {forceEmail: email.trim()} : {})
    })
  }

  async function getEvmAddress() {
    const provider = await sdk.evm.getEthersProvider()
    const signer = await provider.getSigner()
    const address = await signer.getAddress()
    setEvmAddress(address)
  }

  async function getSuiAddress() {
    const address = await sdk.sui.getAddress()
    setSuiAddress(address)
  }

  async function updateProfile(){
    await sdk.account.updateProfile({
      name: 'test name',
      picture: 'https://cloudflare-ipfs.com/ipfs/bafkreifhim7rcuuladklif4mwov3guiw534gnl5mctf34ik63x4wzsvhle'
    })
  }

  useEffect(() => {
    const sdkPromise = sdk.initialize()
    const unsubscribe = sdk.on('LOGIN', async function() {
      await sdkPromise
      setIsCredenzaLoggedIn(true)
      updateProfile()
      getEvmAddress()
      getSuiAddress()
    })
    return () => unsubscribe()
  }, [])

  return (
    <div>
      <div>With Sdk:</div>
      {!isCredenzaLoggedIn && (<>
        <input type="email" name="email" style={{minWidth: '400px'}} value={email} onChange={(e) => setEmail(e.target.value)}/>
        <br />
        <button onClick={credenzaAuthorize}>Authorize with Credenza</button>
      </>)}
      {evmAddress && <div>Evm Address: {evmAddress}</div>}
      {suiAddress && <div>Sui Address: {suiAddress}</div>}
    </div>
  );
}
