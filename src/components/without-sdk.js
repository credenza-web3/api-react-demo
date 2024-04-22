import { useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'

const NONCE = 'replace_with_nonce'
const STATE = 'replace_with_state'

function buildCredenzaAuthUrl() {
  const url = new URL('https://accounts.staging.credenza3.com/oauth2/authorize')
  url.searchParams.append('client_id', process.env.REACT_APP_CREDENZA_CLIENT_ID)
  url.searchParams.append('response_type', 'token')
  url.searchParams.append('scope', 'profile.write blockchain.evm blockchain.sui')
  url.searchParams.append('state', STATE)
  url.searchParams.append('redirect_uri', window.location.origin + '/without-sdk')
  url.searchParams.append('nonce', NONCE)
  url.searchParams.append('credenza_session_length_seconds', 60 * 60 * 24)
  return url.toString()
}

export function WithoutSdk() {
  const [credenzaAccessToken, setCredenzaAccessToken] = useState(false)
  const [evmAddress, setEvmAddress] = useState()
  const [suiAddress, setSuiAddress] = useState()

  function credenzaAuthorize() {
    window.location.href = buildCredenzaAuthUrl()
  }

  async function getEvmAddress(accessToken) {
    const response = await fetch('https://evm.staging.credenza3.com/accounts/address', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    const data = await response.json()
    setEvmAddress(data.address)
  }

  async function getSuiAddress(accessToken) {
    const response = await fetch('https://sui.staging.credenza3.com/accounts/address', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    const data = await response.json()
    setSuiAddress(data.address)
  }

  async function updateProfile(accessToken) {
    await fetch('https://accounts.staging.credenza3.com/accounts/me', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        name: 'TestName',
        picture: 'https://cloudflare-ipfs.com/ipfs/bafkreifhim7rcuuladklif4mwov3guiw534gnl5mctf34ik63x4wzsvhle',
      })
    })
  }

  function getRedirectAccessToken() {
    const hash = window.location.hash
    if (!hash || !window.location.pathname.includes('without-sdk')) return

    const hashObj = hash
      .replace('#', '')
      .split('&')
      .reduce((acc, item) => {
        const [key, val] = item.split('=')
        acc[key] = val
        return acc
      }, {})

    if (!hashObj.access_token) throw new Error('Invalid access token')

    if (hashObj.state !== STATE) return

    const decodedJwt = jwtDecode(hashObj.access_token)
    if (decodedJwt.nonce !== NONCE) return

    if (window.history) {
      window.history.replaceState(null, document.title, window.location.pathname + window.location.search)
    } else {
      window.location.hash = ''
    }

    setCredenzaAccessToken(hashObj.access_token)
    return hashObj.access_token
  }

  useEffect(function () {
    const accessToken = getRedirectAccessToken()
    if (!accessToken) return
    updateProfile(accessToken)
    getEvmAddress(accessToken)
    getSuiAddress(accessToken)
  }, [])
  return (
    <div>
      <div>WithoutSdk:</div>
      <br/>
      {!credenzaAccessToken && <button onClick={credenzaAuthorize}>Authorize with Credenza</button>}
      {evmAddress && <div>Evm Address: {evmAddress}</div>}
      {suiAddress && <div>Sui Address: {suiAddress}</div>}
    </div>
  );
}
