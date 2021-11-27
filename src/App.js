import React from 'react';
import './App.css';
import LightHeader from './LightHeader';
import LightsDisplay from './LightsDisplay';
import Web3 from 'web3';
import {LIGHT_PROJ_ABI, LIGHT_PROJ_ADDRESS} from './config';

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
    };
    this.handleLightChange = this.handleLightChange.bind(this);
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.updateLightList = this.updateLightList.bind(this);
  }

  componentDidMount() {
    //initialize the web3 object and store it in state
    //const web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:8545');
    const web3 = new Web3("ws://127.0.0.1:8545/");
    this.setState({web3});

    //load contract
    const lightProj = new web3.eth.Contract(LIGHT_PROJ_ABI, LIGHT_PROJ_ADDRESS);
    this.setState({lightProjContract: lightProj});

    //register for events
    window.ethereum.on('accountsChanged', this.handleAccountsChanged);
    window.ethereum.on('chainChanged', this.handleNetworkChanged);
  }

  handleAccountsChanged(accounts){
    // Time to reload your interface with accounts[0]!
    this.setState({usrAddr : accounts[0]});
    console.log("handleAccountsChanged: "+accounts[0]);
    this.updateLightList();
  }

  handleNetworkChanged(chainId){
    // Time to reload your interface with the new networkId
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
        this.setState({usrLightProjContract: usrLightProj});

        this.setState({
          usrAddr : accounts[0],
          usrWeb3
        });
        this.updateLightList();

        this.state.lightProjContract.events.LightToggled({}, function(error, event){ console.log(event); })
      .on('data', this.updateLightList)
      .on('changed', function(event){
          // remove event from local database
      })
      .on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
          console.log("err: "+error);
      });
      }
    }
  }

  handleBalanceOf(error, result){
    console.log("Balance: "+result);
  }

  async updateLightList(){
    if(this.state.usrAddr){
      //update the list of elements that are currently being rendered by the carousel
      const balance = await this.state.lightProjContract.methods.balanceOf(this.state.usrAddr).call();
      console.log("balance: "+balance);
      let lightList = [];
      let lightIdList = [];
      for(var i=0 ; i < balance ; i++){
        const lightId = await this.state.lightProjContract.methods.tokenOfOwnerByIndex(this.state.usrAddr,i).call();
        const lightURI = await this.state.lightProjContract.methods.tokenURI(lightId).call();
        const response = await fetch(lightURI);
        const lightJSON = await response.json();
        const nft = {id: lightId, name: lightJSON.name, description: lightJSON.description, image: lightJSON.image};
        lightList.push(nft);
        lightIdList.push(lightId);
      }
      console.log("list:"+lightList);
      this.setState({nftArray : lightList});
    }
    else{
      this.setState({nftArray: []});
    }
  }

  handleLightChange(id){
    //handle sending the toggle light in the contract for the specified NFT ID
    console.log("Hanlding Change Light:"+id);  


    // using the event emitter
    this.state.usrLightProjContract.methods.toggleLight(id).send({from: this.state.usrAddr})
.on('transactionHash', function(hash){
    console.log("Transaction Hash");
})
.on('receipt', function(receipt){
    // receipt example
    console.log(receipt);
})
.on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
    console.log(error);
});
  }

  render(){
    return (
      <div className="App">
       <LightHeader userAddress={this.state.usrAddr} onConnect={() => this.handleConnect()} />
       <LightsDisplay onChange={this.handleLightChange} lightArray={this.state.nftArray} />
       
       {/*<p/>
       <table>
       {this.state.nftArray.map(light => (
         <tr key={light.id}>
           <td>{light.id}</td>
           <td>{light.name}</td>
           <td>{light.description}</td>
           <td>{light.image}</td>
           <td><img src={light.image}/></td>
         </tr>
       ))
       }
      </table>*/}

      </div>
    );
  }
}


export default App;
