import React from 'react';
import './App.css';
import LightHeader from './LightHeader';
import LightsDisplay from './LightsDisplay';
import Web3 from 'web3';
import {LIGHT_PROJ_ABI, LIGHT_PROJ_ADDRESS} from './config';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      usrAddr : null,
      usrConnected : false,
      lightArray : [
        {id: 1, image: "holder.js/800x600?text=First slide&bg=373940",
        name: "First Slide LaBel",
        description: "This slide came first, and thus will be rendered.... first!"},
        {id: 2, image: "holder.js/800x600?text=Second slide&bg=282c34",
        name: "Seccond Slide lAbEl",
        description: "This slide is number 2. No one cares..."}],
      nftArray : [],
      genNFT : null,
    };
    this.handleLightChange = this.handleLightChange.bind(this);
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.updateLightList = this.updateLightList.bind(this);
    this.updateGenesis = this.updateGenesis.bind(this);
  }

  async componentDidMount() {
    //initialize the web3 object and store it in state
    //const web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:8545');
    const web3 = new Web3("ws://127.0.0.1:8545/");
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
    const sub = lightProj.events.LightToggled({
      filter:{tokenId:"0"} //filter for only the genesis NFT.  Will register separately for others...
    })
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
      this.updateFeeAmt();
      
  }

  componentWillUnmount(){
    //TODO unregister for events here
    this.state.lightSub.unsubscribe();
  }

  handleAccountsChanged(accounts){
    // Time to reload your interface with accounts[0]!
    this.setState({usrAddr : accounts[0]});
    console.log("handleAccountsChanged: "+accounts[0]);
    if(this.state.usrSubscription){
      this.state.usrSubscription.unsubscribe();
      this.setState({usrSubscription:null});
    }
    this.updateLightList();
  }

  handleNetworkChanged(chainId){
    // Time to reload your interface with the new networkId
    //disable buttons if on wrong network
  }

  async handleConnect(){
    //Connect the users wallet here and update display
    console.log("clicked");
    if(!this.state.usrConnected){
      //connect
      const usrWeb3 = new Web3(Web3.givenProvider);
      const accounts = await usrWeb3.eth.requestAccounts().catch((err) => { console.error("myError:"+err)});
      
      //if there are accounts, then login was successful
      //console.log(accounts);
      if(accounts){
        //
        //load contract
        const usrLightProj = new usrWeb3.eth.Contract(LIGHT_PROJ_ABI, LIGHT_PROJ_ADDRESS);
        this.setState({
          usrLightProjContract: usrLightProj,
          usrAddr : accounts[0],
          usrWeb3
        });
        this.updateLightList();
        this.updateFeeAmt();
      }
    }
  }

  handleBalanceOf(error, result){
    console.log("Balance: "+result);
  }

  //Update the data of the genesis light
  async updateGenesis(){
    const genNFT = await this.fetchNFTData(0);
    this.setState({genNFT});
  }

  //get the NFT URI data
  async fetchNFTData(lightId){
    const lightURI = await this.state.lightProjContract.methods.tokenURI(lightId).call();
    const response = await fetch(lightURI);
    const lightJSON = await response.json();
    const nft = {id: lightId, name: lightJSON.name, description: lightJSON.description, image: lightJSON.image};
    return nft;
  }

  //build list of user's light NFTs
  async updateLightList(){
    let lightList = [];
    let lightIds = [];

    if(this.state.usrAddr){
      //update the list of elements that are currently being rendered by the carousel
      const balance = await this.state.lightProjContract.methods.balanceOf(this.state.usrAddr).call();  

      //fetch any other owned NFTs
      for(var i=0 ; i < balance ; i++){
        const lightId = await this.state.lightProjContract.methods.tokenOfOwnerByIndex(this.state.usrAddr,i).call();
        if(lightId > 0){ //don't fetch genesis light again
          const nft = await this.fetchNFTData(lightId);
          lightList.push(nft);
          lightIds.push(lightId);
        }
      }
      this.registerUserLights(lightIds);
    }
    this.setState({nftArray : lightList});
  }

  //register for LightToggled events, but filtered for just the user's owned NFTs
  registerUserLights(lightIds){
    //register for light toggle events on the contract.  
    const sub = this.state.usrLightProjContract.events.LightToggled({
      filter:{tokenId:lightIds} //filter for only the genesis NFT.  Will register separately for others...
    })
      .on('connected', function(subscriptionId){
        console.log("LightToggled Subscription: "+subscriptionId);
      })
      .on('data', this.updateLightList)
      .on('error', function(error, receipt) { 
        // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
          console.log("err: "+error);
          console.log("receipt:"+receipt);
      });
      this.setState({usrSubscription:sub});
  }

  //query the contract and update the fee.
  async updateFeeAmt(){
    const fee = await this.state.lightProjContract.methods.getGenesisFee().call(); 
    this.setState({fee});
  }

  handleLightChange(id){
    //handle sending the toggle light in the contract for the specified NFT ID
    
    if(id === 0) //if the ID is equal to zero, call the 
    {
      // using the event emitter
      this.state.usrLightProjContract.methods.toggleGenesis().send({from: this.state.usrAddr, value: this.state.fee})
        .on('transactionHash', function(hash){ //transaction added
            console.log("Transaction Hash");
        })
        .on('receipt', function(receipt){//transaction completed
            console.log("receipt");
            console.log(receipt);
        })
        .on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
            console.log(error);
        });
    }
    else{ //if ID is greater than zero, call the toggleLight function on the contract
      // using the event emitter
      this.state.usrLightProjContract.methods.toggleLight(id).send({from: this.state.usrAddr})
        .on('transactionHash', function(hash){ //transaction added
            console.log("Transaction Hash");
        })
        .on('receipt', function(receipt){//transaction completed
            console.log("receipt");
            console.log(receipt);
        })
        .on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
            console.log(error);
        });
    }
  }

  render(){
    return (
      <div className="App">
       <LightHeader userAddress={this.state.usrAddr} onConnect={() => this.handleConnect()} />
       <LightsDisplay onChange={this.handleLightChange} lightArray={this.state.nftArray} usrAddr={this.state.usrAddr} genesisLight={this.state.genNFT} genFee={this.state.fee}/>
       <p/>
       {this.state.genNFT ? 
       <><h2 class="myCenter">Example Light NFT</h2>
       <Card style={{ width: '66vw' }} className="genCard">
        
        <Card.Img variant="top" src={this.state.genNFT.image} />
        <Card.Body>
          <Card.Title>{this.state.genNFT.name}</Card.Title>
          <Card.Text>
            {this.state.genNFT.description} {this.state.fee ? 
             <div>Cost to toggle this light is {this.state.web3.utils.fromWei(this.state.fee+"")} MATIC.</div> : <></>}
          </Card.Text>
          <Button variant="primary" onClick={() => this.handleLightChange(0)}>Toggle Light</Button>
        </Card.Body>
      </Card></>
       : <p></p>}
       <p></p>
       Footer goes here.
      </div>
    );
  }
}

export default App;
