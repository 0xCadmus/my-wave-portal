import React, { useEffect, useState } from "react";
import * as ethers from "ethers";
import './App.css';
import waveportal from './utils/WavePortal.json';

const App = () => {

  /*
   * State Property to store all waves
   */

  const [allWaves, setAllWaves] = useState([]);
  const [chainId, setChainId] = useState();
  const [currentAccount, setCurrentAccount] = useState("");
  const [message, setMessage] = useState("");
  const contractAddress = "0x7255cB731e234Ce72A38Dc0f4c63661c74a6BdA6";

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log("No authorized account found")
      }

    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const waveportalContract = new ethers.Contract(contractAddress, waveportal.abi, signer);


        let count = await waveportalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
        * Execute the actual wave from your smart contract
        */
        const waveTxn = await waveportalContract.wave(message)
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  /*
  * Create a method that gets all waves from your contract
  */
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const waveportalContract = new ethers.Contract(contractAddress, waveportal.abi, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await waveportalContract.getAllWaves();

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /**
         * Listen in for emitter events!
         */
        waveportalContract.on("NewWave", (from, timestamp, message) => {
          console.log("NewWave", from, timestamp, message);

          setAllWaves(prevState => [...prevState, {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message
          }]);
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          👋 Hey there!
        </div>

        <div className="bio">
          Hello, my name is Landon! I love my cats, but I don't have enough time to play with them 🙁. Maybe you can play with my cats?
        </div>

        {/* Render this button when a wallet is not connected */}
        {!currentAccount && (
          <button className="waveButton" style={{ backgroundColor: "rgba(229, 231, 235)", marginTop: "16px", padding: "8px", borderRadius: "7.5px" }} onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        <input type="button"
          className="textButton"
          value="Pet My Cats 😊"
          onClick={wave}
        />

        <input onChange={event => setMessage(event.target.value)}
          value={message}
          style={{ backgroundColor: "White", border: "0", marginTop: "16px", padding: "8px", borderRadius: "7.5px" }}
          placeholder="Send a message" />

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "rgba(229, 231, 235)", marginTop: "16px", padding: "8px", borderRadius: "7.5px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}

      </div>
    </div>
  );
}

export default App