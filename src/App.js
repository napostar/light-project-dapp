import logo from './logo.svg';
import './App.css';

import Button from 'react-bootstrap/Button';
import Navbar from 'react-bootstrap/Navbar';

import Container from 'react-bootstrap/Container';

function App() {
  return (
    <div className="App">
      <Navbar sticky="top" bg="dark">
        <Container>
          <Navbar.Brand bsPrefix="lp-header">The Light Project</Navbar.Brand>
        </Container>
        <Container className="justify-content-end">
          <Button variant="primary">Connect Wallet</Button>
        </Container>
      </Navbar>
  
  

      <header className="App-header">
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <p>
          <Button variant="primary">Primary</Button>
        </p>
      </header>
    </div>
  );
}

export default App;
