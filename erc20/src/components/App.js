import React, { Component } from 'react';
//import logo from '../logo.png';
import './App.css';
import Web3 from 'web3';
//import web3 from '../ethereum/web3';
import contractInfo from '../abis/Main.json';

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      
      try {
          await window.ethereum.enable()
      } catch(error) {
          alert('User denied account access...')
      }
    }

    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }

    else {
      alert('Non-Ethereum browser detected. You should try Metamask')
    }
  }

  loadBlockchainData = async () => {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    const networkId = await web3.eth.net.getId()
    const networkData = contractInfo.networks[networkId]

    console.log(accounts)
    console.log('networkId', networkId)
    console.log('networkData', networkData)
    
    if (networkData) {
      const abi = contractInfo.abi
      const contractAddress = networkData.address
      const contract = new web3.eth.Contract(abi, contractAddress)
      const owner = await contract.methods.getOwner.call()
      const tokenAddress = await contract.methods.getTokenAddress.call()

      console.log('abi', abi)
      console.log('contractAddress', contractAddress)

      this.setState({contract})
      this.setState({contractAddress})
      this.setState({accounts})
      this.setState({owner})
      this.setState({tokenAddress})
      
      console.log('owner', this.state.owner)

    } else {
      window.alert('¡Smart Contract NOT deployed on the net!')
    }
  }

  constructor(props){
    super(props)
    this.state = {
      contract: null,
      quantity: 0,
      accounts: null,
      contractAddress: null,
      address: null,
      owner: null,
      loading: false,
      errorMessage: null,
      addressBalance: null,
      tokenAddress: null
    }
  }

  sendTokens = async (address, price, quantity) => {
    try {
       await this.state.contract.methods.sendTokens(address, quantity).send({from: this.state.accounts[0], value: price})
    } catch(error){
      this.setState({errorMessage: error.message})
    } finally {
      this.setState({loading: false})
    }
  }

  balanceOf = async (address) => {
    try {
      const addressBalance = await this.state.contract.methods.balanceOf(address).call()
      this.setState({addressBalance})
      return parseFloat(addressBalance)
    } catch(error) {
      this.setState({errorMessage: error.message})
    } finally {
      this.setState({loading: false})
    }
  }

  balanceAll = async () => {
    try {
      const totalBalance = await this.state.contract.methods.balanceAll.call()
      return parseFloat(totalBalance)
    } catch(error) {
      this.setState({errorMessage: error.message})
    } finally {
      this.setState({loading: false})
    }
  }

  generateTokens = async (numTokens) => {
    try {
      const accounts = await window.web3.eth.getAccounts()
      await this.state.contract.methods.generateTokens(numTokens).send({from: accounts[0]})
    } catch(error) {
      this.setState({errorMessage: error.message})
    } finally {
      this.setState({loading: false})
    }
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
              <small className='text-white'><span id='account'>Contract Address: {this.state.contractAddress}</span></small>
            </li>
            <li className='nav-item text-nowrap d-none d-sm-none d-sm-block'>
              <small className='text-white'><span id='account'>Token Address: {this.state.tokenAddress}</span></small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1>Buy Tokens ERC-20</h1>
                <form onSubmit={async (event) => {
                  event.preventDefault()
                  const address = this.address.value
                  const quantity = this.quantity.value
                  const price = await this.state.contract.methods.getTokenPrice(quantity).call()
                  //const parsedPrice = parseFloat(price).toString()
                  //const weis = window.web3.utils.toWei(parsedPrice, 'ether')
                  
                  this.sendTokens(address, price, quantity)
                }}>
                  <input type='text' className='form-control mb-1' placeholder='To Address' ref={(input) => this.address = input} />
                  <input type='text' className='form-control mb-1' placeholder='Quantity (1 Token = 1 Ether)' ref={(input) => this.quantity = input} />
                  <input type='submit' className='btn btn-block btn-success btn-sm' value='Buy Tokens' />
                </form>
                &nbsp;
                <h1>Total User's Balance</h1>
                <form onSubmit={async (event) => {
                  event.preventDefault()
                  const address = this.address.value
                  const balance = await this.balanceOf(address)
                  this.balance.value = balance
                }}>
                  <input type='text' className='form-control mb-1' placeholder="User's Address" ref={(input) => this.address = input} />
                  <input type='text' className='form-control mb-1' disabled="disabled" placeholder="Balance" ref={(input) => this.balance = input} />
                  <input type='submit' className='btn btn-block btn-warning btn-sm' value='Balance' />
                </form>
                &nbsp;
                <h1>Total Balance</h1>
                <form onSubmit={async (event) => {
                  event.preventDefault()
                  const totalBalance = await this.balanceAll()
                  this.totalBalance.value = totalBalance
                }}>
                  <input type='text' className='form-control mb-1' disabled="disabled" placeholder="Balance" ref={(input) => this.totalBalance = input} />
                  <input type='submit' className='btn btn-block btn-primary btn-sm' value='Balance' />
                </form>
                &nbsp;
                <h1>Add New Tokens</h1>
                <form onSubmit={async (event) => {
                  event.preventDefault()
                  const numTokens = this.numTokens.value
                  await this.generateTokens(numTokens)
                }}>
                  <input type='text' className='form-control mb-1' placeholder="Tokens" ref={(input) => this.numTokens = input} />
                  <input type='submit' className='btn btn-block btn-danger btn-sm' value='Generate' />
                </form>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;