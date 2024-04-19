import { useState, useEffect } from 'react'
import { ethers } from "ethers";
import { fetchCredenzaContractJson } from '@credenza-web3/contracts-lib'

import { CredenzaSDK } from '@credenza3/core-web'
import { OAuthExtension } from '@credenza3/core-web-oauth-ext'
import { AccountExtension } from '@credenza3/core-web-account-ext'
import { EvmExtension } from '@credenza3/core-web-evm-ext'
import { SuiExtension } from '@credenza3/core-web-sui-ext'

const spicyChainConfig = {
  chainId: '0x15b32',
  rpcUrl: 'https://chiliz-spicy.publicnode.com',
  displayName: 'Spicy',
  blockExplorer: 'https://spicy-explorer.chiliz.com/',
  nativeCurrency: {
    name: 'CHZ',
    symbol: 'CHZ',
    decimals: 18,
  },
}

const sdk = new CredenzaSDK({
  clientId: '65954ec5d03dba0198ac343a',
  // env: 'staging', // remove for prod
  extensions: [
    new SuiExtension({ suiNetwork: SuiExtension.SUI_NETWORK.DEVNET }),
    new EvmExtension({ chainConfig: spicyChainConfig }),
    new OAuthExtension(),
    new AccountExtension(),
  ],
})

export function WithSdk() {
  const [email, setEmail] = useState('')
  const [isCredenzaLoggedIn, setIsCredenzaLoggedIn] = useState(false)
  const [suiAddress, setSuiAddress] = useState()
  const [evmAddress, setEvmAddress] = useState()
  const [pointsLoyaltyContract, setLoyaltyContractPoints] = useState()
  const [membership, setMembership] = useState()
  const [tokenBalance, setTokenBalance] = useState()

  async function credenzaAuthorize() {
    try {
      await sdk.oauth.revokeSession()
    } catch (e) { }

    sdk.oauth.login({
      scope: 'profile.write blockchain.evm blockchain.evm.write blockchain.sui',
      redirectUrl: window.location.origin + '/with-sdk',
    })
  }
  async function getSigner() {
    const provider = await sdk.evm.getEthersProvider()
    const signer = await provider.getSigner()
    return signer
  }

  async function getEvmAddress() {
    const signer = await getSigner()
    const address = await signer.getAddress()
    setEvmAddress(address)
    requestLoyaltyPoints(address)
    isMembership(address)
    getBalanceTokens(address)
  }

  async function getSuiAddress() {
    const address = await sdk.sui.getAddress()
    setSuiAddress(address)
  }

  async function updateProfile() {
    await sdk.account.updateProfile({
      name: 'test name',
      picture: 'https://cloudflare-ipfs.com/ipfs/bafkreifhim7rcuuladklif4mwov3guiw534gnl5mctf34ik63x4wzsvhle'
    })
  }

  useEffect(() => {
    const sdkPromise = sdk.initialize()
    const unsubscribe = sdk.on('LOGIN', async function () {
      await sdkPromise
      setIsCredenzaLoggedIn(true)
      updateProfile()
      getEvmAddress()
      getSuiAddress()
    })
    return () => unsubscribe()
  }, [])


  async function getContract(name, contractAddress) {
    const signer = await getSigner()
    const { abi } = await fetchCredenzaContractJson({
      name
    })
    const contract = new ethers.Contract(
      contractAddress,
      abi,
      signer
    );
    return contract
  }

  async function addLoyaltyContractPoints() {
    const loyaltyContract = await getContract("LedgerContract", "0xef998e788d3375f944ac6d64a409aa5cb9d1ad21")
    const tx = await loyaltyContract.addPoints(evmAddress, 1, 1)
    await tx.wait()
    requestLoyaltyPoints(evmAddress)
  }

  async function requestLoyaltyPoints(address) {
    const loyaltyContract = await getContract("LedgerContract", "0xef998e788d3375f944ac6d64a409aa5cb9d1ad21")
    const points = await loyaltyContract.checkPoints(address);
    setLoyaltyContractPoints(String(points))
  }

  async function isMembership(address) {
    const membershipContract = await getContract("SellableMetadataMembershipContract", "0xc048690a272b2ef4de3d97d983603dfab60a79db")
    const isMember = await membershipContract.confirmMembership(address);
    setMembership(String(isMember));
  };

  async function getBalanceTokens(address) {
    const erc1155Contract = await getContract("CredenzaERC1155Contract", "0x4ade9fe4b34add155bc2479a55d50b2624d6b86a")
    const isBalance = await erc1155Contract.balanceOf(address, 2)

    setTokenBalance(String(isBalance));
  }

  async function transferTokens() {
    const erc1155Contract = await getContract("CredenzaERC1155Contract", "0x4ade9fe4b34add155bc2479a55d50b2624d6b86a")
    const tx = await erc1155Contract.safeTransferFrom(evmAddress, '0x3251679Cf91EF3D5ca7b2168510EAb49e5D9Ef59', 2, 1, ethers.ZeroHash)
    await tx.wait()
    getBalanceTokens(evmAddress)
  }

  async function buyToken() {
    const sellable1155Contract = await getContract("CredenzaERC1155Contract", "0x42e2e700e061b74c39adda516208fdcfebff3cd3")
    const priceToken = await sellable1155Contract.getPriceToken(1).then((result) => Number(result))

    const credContract = await getContract("CredenzaToken", "0x5619A31C5776c50e4A3f6DD3E07be13f4efa211C")
    const approveTx = await credContract.approve('0x42e2e700e061b74c39adda516208fdcfebff3cd3', priceToken)
    await approveTx.wait()

    const tx = await sellable1155Contract['buyWithToken(uint256,uint256,address)'](1, 1, evmAddress);

    await tx.wait()
    getBalanceTokens(evmAddress)
  }

  return (
    <div>
      <div>With Sdk:</div>
      <br />
      {!isCredenzaLoggedIn && (<>
        <input type="email" name="email" style={{ minWidth: '400px' }} value={email} onChange={(e) => setEmail(e.target.value)} />
        <br />
        <button onClick={credenzaAuthorize}>Authorize with Credenza</button>
      </>)}
      {evmAddress && <div>Evm Address: {evmAddress}</div>}
      {suiAddress && <div>Sui Address: {suiAddress}</div>}
      <br />
      {pointsLoyaltyContract && <div>Loyalty Contract Points: {pointsLoyaltyContract}</div>}
      {pointsLoyaltyContract && <button onClick={addLoyaltyContractPoints}>Add points to a loyalty contract</button>}
      <br />
      <br />
      {membership && <div>Membership: {membership}</div>}
      <br />
      {tokenBalance && <div>Balance Token: {tokenBalance}</div>}
      {tokenBalance && <button onClick={transferTokens}>TransferToken</button>}
      {tokenBalance && <button onClick={buyToken}>Buy Tokens</button>}
    </div>
  );
}
