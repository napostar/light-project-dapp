import React from 'react';
import './App.css';
import LightHeader from './LightHeader';
import LightsDisplay from './LightsDisplay';

class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      usrAddr : null,
      usrConnected : false,
      lightArray : [
        {id: 1, img: "holder.js/800x600?text=First slide&bg=373940",
        name: "First Slide LaBel",
        caption: "This slide came first, and thus will be rendered.... first!"},
        {id: 2, img: "holder.js/800x600?text=Second slide&bg=282c34",
        name: "Seccond Slide lAbEl",
        caption: "This slide is number 2. No one cares..."}]
    };
    this.handleLightChange = this.handleLightChange.bind(this);
  }

  handleConnect(){
    //Connect the users wallet here and update display
    console.log("clicked");
    if(!this.state.usrConnected){
        //connect
        this.setState({
            usrAddr : "0xb3c6e053BfA6d9dAeF7434aBD191B3E9422cFd32",
            connected : true
        })
    }
  }

  handleLightChange(id){
    //handle sending the toggle light in the contract for the specified NFT ID
    console.log("Hanlding Change Light:"+id);  
  }

  render(){
    return (
      <div className="App">
       <LightHeader userAddress={this.state.usrAddr} onConnect={() => this.handleConnect()} />
       <LightsDisplay onChange={this.handleLightChange} lightArray={this.state.lightArray} />
      </div>
    );
  }
}


export default App;
