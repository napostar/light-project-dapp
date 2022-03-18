import React from 'react';
import './App.css';
import LightHeader from './LightHeader';

import Web3 from 'web3';
import {LIGHT_PROJ_ABI, LIGHT_PROJ_ADDRESS, networks} from './config';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      usrAddr : null,
      usrConnected : false,
      genNFT : null,
    };
    this.handleLightChange = this.handleLightChange.bind(this);
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.updateGenesis = this.updateGenesis.bind(this);
  }
   
  async componentDidMount() {
    //initialize the web3 object and store it in state
    const web3 = new Web3("wss://polygon-mumbai.g.alchemy.com/v2/X5yiJfvgIclpFPQH0o0PUlaKi0jmssX2");
    this.setState({web3});

    //load contract
    const lightProj = new web3.eth.Contract(LIGHT_PROJ_ABI, LIGHT_PROJ_ADDRESS);
    //save contract for function calls
    this.setState({lightProjContract: lightProj});
    
    //update genesis NFT data
    const lightURI = await lightProj.methods.tokenURI(0).call();
    const response = await fetch(lightURI);
    const lightJSON = await response.json();
    const nft = {id: 0, name: lightJSON.name, description: lightJSON.description, image: lightJSON.image};
    this.setState({genNFT : nft});

    //register for events
    window.ethereum.on('accountsChanged', this.handleAccountsChanged);
    window.ethereum.on('chainChanged', this.handleNetworkChanged);

    //register for light toggle events on the contract.  
    const sub = lightProj.events.LightToggled()
      .on('connected', function(subscriptionId){
        console.log("LightToggled Subscription: "+subscriptionId);
      })
      .on('data', this.updateGenesis)
      .on('error', function(error, receipt) { 
        // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
          console.log("err: "+error);
          console.log("receipt:"+receipt);
      });
      this.setState({lightSub: sub}); 
  }

  componentWillUnmount(){
    //unregister for events here
    this.state.lightSub.unsubscribe();
  }

  handleAccountsChanged(accounts){
    // Time to reload your interface with accounts[0]!
    this.setState({usrAddr : accounts[0]});
    console.log("handleAccountsChanged: "+accounts[0]);
  }

  handleNetworkChanged(newChainId){
    // Time to reload your interface with the new networkId
    //disable buttons if on wrong network
    //const chainId = 137 // Polygon Mainnet
    //80001 is mumbai
    
    console.log('Changed to chainID:'+newChainId);
  }

  async handleConnect(){
    //Connect the users wallet here and update display
    if(!this.state.usrConnected){
      //connect
      const usrWeb3 = new Web3(Web3.givenProvider);
      const accounts = await usrWeb3.eth.requestAccounts().catch((err) => { console.error("error during requestAccounts:"+err)});
      console.log('chainID:'+window.ethereum.networkVersion);

      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            ...networks['mumbai']
          }
        ]
      });
      
      //if there are accounts, then login was successful
      if(accounts){
        //load contract
        const usrLightProj = new usrWeb3.eth.Contract(LIGHT_PROJ_ABI, LIGHT_PROJ_ADDRESS);
        this.setState({
          usrLightProjContract: usrLightProj,
          usrAddr : accounts[0],
          usrWeb3
        });
        this.updateFeeAmt();
      }
    }
  }

  //Update the data of the genesis light
  async updateGenesis(){
    console.log("Update Genesis");
    const newGenNFT = await this.fetchNFTData(0);
    this.setState({genNFT: newGenNFT});
  }

  //get the NFT URI data
  async fetchNFTData(lightId){
    const lightURI = await this.state.lightProjContract.methods.tokenURI(lightId).call();
    const response = await fetch(lightURI);
    const lightJSON = await response.json();
    const nft = {id: lightId, name: lightJSON.name, description: lightJSON.description, image: lightJSON.image};
    return nft;
  }

  //query the contract and update the fee.
  async updateFeeAmt(){
    const fee = await this.state.lightProjContract.methods.getTokenFee(0).call(); 
    this.setState({fee});
  }

  handleLightChange(id){
    //handle sending the toggle light in the contract for the specified NFT ID
    //call the toggleLight function on the contract
    // using the event emitter
    this.state.usrLightProjContract.methods.toggleLight(id).send({from: this.state.usrAddr, value: this.state.fee})
      .on('transactionHash', function(hash){ //transaction added
          //console.log("Transaction Hash");
      })
      .on('receipt', function(receipt){//transaction completed
          //console.log("receipt");
          //console.log(receipt);
         // this.updateGenesis();
      })
      .on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
          console.log(error);
      });
  }

  wrapWithGateway(ipfsURI){
    const strArray = ipfsURI.split('ipfs://');
    return 'http://ipfs.io/ipfs/' + strArray[1];
  }


  render(){
    return (
      <div className="App">
       <LightHeader userAddress={this.state.usrAddr} onConnect={() => this.handleConnect()} />
       <div className="jumbotron">
          <div className="p-5 bg-light border rounded-3">
              <h2>Dynamic NFTs</h2>
              <span>The light project is about an exploration of dynamic NFTs, their utility, and functionality. Connect your wallet to interact with our Genesis Light, on-chain!</span>
          </div>
       </div>
       {this.state.genNFT ? 
            <div>
              <h2 className="myCenter">Genesis Light</h2>
              <Card style={{ width: '50vw' }} className="genCard">
                
                <Card.Img variant="top" src={this.wrapWithGateway(this.state.genNFT.image)} />
                <Card.Body>
                  <Card.Title>{this.state.genNFT.name}</Card.Title>
                  <Card.Text>
                    {this.state.genNFT.description} 
                    Press "Toggle Light" to turn the light on or off, it's state is stored on-chain!
                  </Card.Text>
                  <Button variant="primary" onClick={() => this.handleLightChange(0)}>Toggle Light</Button>
                </Card.Body>
              </Card>
            </div>
       : <span></span>};
       <span></span>
       
      </div>
    );
  }
}
export default App;
