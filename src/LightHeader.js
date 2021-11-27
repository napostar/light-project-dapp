import React from "react";
import Button from "react-bootstrap/Button";
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import logo from './logo.svg';

class LightHeader extends React.Component {

  prettyPrintAddr(addr){
      //"0xasd...asdf"
      return addr.substring(0,5) + "..." +addr.substring(addr.length-4,addr.length);
  }

  render() {
    return (
      <>
        <Navbar sticky="top" bg="dark">
        <Container>
          <Navbar.Brand bsPrefix="lp-header">
            <img
          alt=""
          src={logo}
          width="30"
          height="30"
          className="d-inline-block align-top"
        /> The Light Project</Navbar.Brand>
        </Container>
        <Container className="justify-content-end">
          <Button variant="primary" onClick={() => this.props.onConnect()}>{this.props.userAddress? this.prettyPrintAddr(this.props.userAddress) : "Connect Wallet"}</Button>
        </Container>
      </Navbar>
      </>
    );
  }
}

export default LightHeader;