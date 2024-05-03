import { Passport } from "@credenza3/passport-evm";
import { useEffect, useState } from 'react'
import { getCredenzaContract } from '@credenza-web3/contracts-lib';

let passport
export function WithPassport() {
  const [evmAddress, setEvmAddress] = useState()
  const [membership, setMembership] = useState()
  const [tokenBalance, setTokenBalance] = useState()
  const [requestContractAddress, setRequestContractAddress] = useState();
  const [requestEventId, setRequestEventId] = useState();
  const [purchaseContractAddress, setPurchaseContractAddress] = useState('0x031d3E3D026480C938cC4AC4605EcCc57910F5CB')
  const [purchaseTokenId, setPurchaseTokenId] = useState('1')
  const [transferTokensContractAddress, setTransferTokensContractAddress] = useState('0x031d3E3D026480C938cC4AC4605EcCc57910F5CB')
  const [transferTokensRecipient, setTransferTokensRecipient] = useState('0x95777D54851fac3F48f739E5fBf65A42ad2777B8')
  const [isLoggedIn, setIsLoggedIn] = useState(null)
  const [selectedChainId, setSelectedChainId] = useState('80002')
  
  async function initPassport() {
    passport = new Passport({
      chainId: selectedChainId,
      clientId: "65ae84e382b59c55c07cb5d9",
      config: {
        content: {
          cloak: false,
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
    const passportPromise = passport.init()
    passport.on('LOGIN', async function () {
      await passportPromise
      setIsLoggedIn(true)
    })
    passport.on('LOGOUT', function () { setIsLoggedIn(false) })
    await passportPromise;
    setIsLoggedIn(passport.isLoggedIn)
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
    console.log('selectedChainId', selectedChainId)
  };
  
  useEffect(() => {
    const initialize = async () => {
      await initPassport();
    };
    initialize();

  }, [selectedChainId]);

  useEffect(() => {
    const initialize = async () => {
      if (isLoggedIn === null) return
      if (isLoggedIn) {
        getEvmAddress();
        getBalanceTokens();
      } else {
        await passport.login("OAUTH")
      }
    };
    initialize();
  }, [isLoggedIn, selectedChainId]);

  async function getEvmAddress() {
    const signer = await passport.provider.getSigner();
    const address = await signer.getAddress();
    setEvmAddress(address)
    isMembership(address)
  }

  async function requestLoyaltyPoints() {
    await passport.requestLoyaltyPoints(requestEventId, requestContractAddress)
  }

  async function isMembership(address) {
    let { isMember, meta } = await passport.checkMembership(address)
    console.log('Membership meta', meta)
    setMembership(String(isMember));
  };

  async function getBalanceTokens() {
    let { result } = await passport.getNfts()
    console.log('balanceTokens', result)
    setTokenBalance(result);
  }

  async function transferTokens() {
    const contractAddress = transferTokensContractAddress
    const recipient = transferTokensRecipient
    const tokenId = "1"
    const amount = 1
    const signer = await passport.provider.getSigner();
    const contract = await getCredenzaContract({
      address: contractAddress,
      signer,
      name: 'CredenzaERC1155Contract'
    });
    const res = await passport.sendNft(contract, recipient, tokenId, amount)
    await res.wait()
    getBalanceTokens()
  }

  async function buyToken() {
    const contractAddress = purchaseContractAddress
    const tokenId = purchaseTokenId
    const amount = 1
    await passport.openUI(Passport.pages.PAYMENT, {
      title: "Buy Token",
      tokens: [{ contractAddress, tokenId, amount }]
    });
  }
  return (
    <div>
      <div className="font-bold">With Passport:</div>
      <br />
      <label>
        <div>
          <span className="font-bold">Select СhainId</span>
        </div>
        <select value={selectedChainId} onChange={(event) => {
          setSelectedChainId(event.target.value);
        }}>
          {Object.entries(Passport.chains || {}).map(([key, value], id) => (
            <option key={key} value={value} id={id}>
              {key} ({value})
            </option>
          ))}
        </select>
      </label>
      <br />
      <br />
      {evmAddress && <div className="font-bold">Evm Address: {evmAddress}</div>}
      <br />
      {membership && <div className="font-bold">Membership: {membership}</div>}
      <br />
      <div>
        <div className="font-bold">Request Loyalty Points</div>
        <label>
          Contract Address
          <br />
          <input
            type="text"
            style={{ minWidth: '320px' }}
            value={requestContractAddress}
            onChange={(e) => setRequestContractAddress(e.target.value)}
            placeholder="Contract Address"
          />
        </label>
        <br />
        <label>
          Event Id
          <br />
          <input
            type="text"
            style={{ minWidth: '160px' }}
            value={requestEventId}
            onChange={(e) => setRequestEventId(e.target.value)}
            placeholder="Event ID"
          />
        </label>
        <button onClick={requestLoyaltyPoints}>Request Loyalty Points</button>
      </div>
      <br />
      {tokenBalance && (
        <div>
          <div>
            <div className="font-bold">Token Balance:{tokenBalance.length > 0 || '0'}</div>
            {tokenBalance.map((token, index) => (
              <div>
                <div key={index}>Token {index + 1}:</div>
                <div>amount:{token.amount} </div>
                <div>tokenAddress:{token.tokenAddress}</div>
                <br />
              </div>
            ))}
          </div>
          <div>
            <div className="font-bold">Transfer Token</div>
            <label>
              Contract Address
              <br />
              <input
                type="text"
                style={{ minWidth: '320px' }}
                value={transferTokensContractAddress}
                onChange={(e) => setTransferTokensContractAddress(e.target.value)}
                placeholder="Contract Address"
              />
            </label>
            <br />
            <label>
              Recipient Address
              <br />
              <input
                type="text"
                style={{ minWidth: '320px' }}
                value={transferTokensRecipient}
                onChange={(e) => setTransferTokensRecipient(e.target.value)}
                placeholder="TokenId"
              />
            </label>
            <br />
            <button onClick={transferTokens}>TransferToken</button>
          </div>
          <br />
          <br />
          <div>
            <div className="font-bold">Buy Token</div>
            <label>
              Contract Address
              <br />
              <input
                type="text"
                style={{ minWidth: '320px' }}
                value={purchaseContractAddress}
                onChange={(e) => setPurchaseContractAddress(e.target.value)}
                placeholder="Contract Address"
              />
            </label>
            <br />
            <label>
              Token Id
              <br />
              <input
                type="text"
                style={{ minWidth: '160px' }}
                value={purchaseTokenId}
                onChange={(e) => setPurchaseTokenId(e.target.value)}
                placeholder="TokenId"
              />
            </label>
            <button onClick={buyToken}>Buy Token</button>
          </div>
        </div>
      )}
    </div>
  );
}


