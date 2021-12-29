import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3';
import Color from '../abis/Color.json';
//import logo from '../logo.png';

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      window.accounts = await window.ethereum.request({ method: 'eth_accounts' })
      await window.ethereum.enable()
    } else {
      window.alert('Take in mind using Metamask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load an account
    const accounts = window.accounts
    this.setState({account: accounts[0]})
    const networkId = await web3.eth.net.getId()
    //const networkId = '5777'
    const newtworkData = Color.networks[networkId]
    if (newtworkData) {
      const abi = Color.abi
      const address = newtworkData.address
      const contract = new web3.eth.Contract(abi, address)
      this.setState({contract})
      const totalSupply = await contract.methods.totalSupply().call()
      this.setState({totalSupply})
      // Load Colors
      for (var i = 1; i <= totalSupply; i++){
        const color = await contract.methods.colors(i - 1).call()
        this.setState({colors: [...this.state.colors, color]})
      }
    }

    else {
      window.alert('¡Smart Contract NOT deployed on the net!')
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      contract: null,
      totalSupply: 0,
      colors: []
    }
  }

  mint = (color) => {
    this.state.contract.methods.mint(color).send({from: this.state.account})
    .once('receipt', (receipt) => {
      this.setState({colors: [...this.state.colors, color]})
    })
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="https://frogames.es/rutas-de-aprendizaje"
            target="_blank"
            rel="noopener noreferrer"
          >
            DApp
          </a>
          <ul className='navbar-nav px-3'>
            <li className='nav-item text-nowrap d-none d-sm-none d-sm-block'>
              <small className='text-white'>
                <span id='account'>{this.state.account}</span>
              </small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1>Collectable DApp of NFTs</h1>
                <form onSubmit={(event) => {
                  event.preventDefault()
                  const color = this.color.value
                  this.mint(color)
                }}>
                  <input type='text' className='form-control mb-1'
                  placeholder='IE: #FFFFFF'
                  ref={(input) => {this.color = input}} />

                  <input
                  type='submit'
                  className='btn btn-block btn-success'
                  value='NEW NFT' />
                </form>
              </div>
            </main>
          </div>
          <hr/>
          <div className='row text-center'>
            {this.state.colors.map((color, key) => {
              return (
                <div key={key} className='col-md-3 mb-3'>
                <div className='token' 
                     style={{backgroundColor: color}}></div>
                  <div>{color}</div>
                </div>
              )
            })}
            </div>
          </div>
      </div>
    );
  }
}

export default App;