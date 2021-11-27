import React from "react";
import Carousel from 'react-bootstrap/Carousel';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import 'holderjs';

class LightsDisplay extends React.Component {
    constructor(props){
        super(props);
        this.onToggle = this.onToggle.bind(this);
    }
    
    onToggle(id){
        console.log("Toggle Light: "+id);
        //This is where we would implement the logic to send a toggleLight transaction to the contract.
        if(this.props.onChange)
            this.props.onChange(id);
    }

    render() {
      return (
        <>
            <div class="row align-items-md-stretch">
                <div class="h-100 p-5 bg-light border rounded-3">
                    <h2>Dynamic NFTs</h2>
                    <p>The light project is about an exploration of dynamic NFTs, and how they can have inherent utility and functionality. Connect your wallet to interact with NFTs you own! Otherwise you can play with our Genesis Light instead!</p>
                    {/*<button class="btn btn-outline-secondary" type="button">Example button</button>*/}
                </div>
            </div>
            {this.props.lightArray && this.props.lightArray.length > 0 ?

            
                <Carousel interval={null}>
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
                : <p>Connect your wallet to see your light NFTs!</p>
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