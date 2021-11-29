import React from "react";
import Carousel from 'react-bootstrap/Carousel';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import 'holderjs';
import './index.css';

class LightsDisplay extends React.Component {
    constructor(props){
        super(props);
        this.state={index:0};
        this.onToggle = this.onToggle.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
    }

    componentDidUpdate(prevProps){
      if(prevProps.lightArray !== this.props.lightArray){
        //need to update the index to a valid value in the new array
        this.setState({index: 0});
      }
    }
    
    onToggle(id){
        console.log("Toggle Light: "+id);
        //This is where we would implement the logic to send a toggleLight transaction to the contract.
        if(this.props.onChange)
            this.props.onChange(id);
    }

    handleSelect(selectedIndex, e){
      this.setState({index: selectedIndex});
    };

    render() {
      return (
        <>
            <div class="jumbotron">
                <div class="p-5 bg-light border rounded-3">
                    <h2>Dynamic NFTs</h2>
                    <p>The light project is about an exploration of dynamic NFTs, and how they can have inherent utility and functionality. Connect your wallet to interact with NFTs you own! Otherwise you can play with our Genesis Light instead!</p>
                    {/*<button class="btn btn-outline-secondary" type="button">Example button</button>*/}
                </div>
            </div>
            {this.props.lightArray && this.props.lightArray.length > 0 ?

            
                <Carousel className="myCarousel"  interval={null} activeIndex={this.state.index} onSelect={this.handleSelect} >
                    {this.props.lightArray.map(light => (
                        <Carousel.Item key={light.id}>
                        <img 
                            className="d-block w-100"
                            src={light.image}
                            alt={light.name}
                        />
                        <Carousel.Caption>
                            <h3>{light.name}</h3>
                            <p>{light.description}</p>
                            <Button onClick={() => this.onToggle(light.id)} >Toggle</Button>
                        </Carousel.Caption>
                    </Carousel.Item>
                    ))}
                </Carousel>
                : 
                <div class="jumbotron">
                <div class="p-5 bg-light border rounded-3">
                    <h2>No NFT Lights Found.</h2>
                    <p>Connect your wallet to see your light NFTs here!</p>
                    {/*<button class="btn btn-outline-secondary" type="button">Example button</button>*/}
                </div>
            </div>
            }
        </>
      );
    }
  }
  export default LightsDisplay;
/*
  <p/>
       <table>
       {this.state.nftArray.map(light => (
         <tr key={light.id}>
           <td>{light.id}</td>
           <td>{light.name}</td>
           <td>{light.description}</td>
           <td>{light.image}</td>
         </tr>
       ))
       }
        </table>*/