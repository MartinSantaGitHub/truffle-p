import React, { Component } from "react";
import './App.css';
import Web3 from "web3";
import loteryContract from '../abis/Lotery.json';
import { Icon } from "semantic-ui-react";
import tokens from '../images/tokens.png';

class Tokens extends Component {
    componentWillMount = async () => {
        await this.loadWeb3()
        await this.loadBlockchainData()
    }

    componentWillUnmount = () => {
        this.state.contractWebSocket.events.returned_tokens().off('data')
    }

    loadWeb3 = async () => {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum)

            try {
                await window.ethereum.enable()
            } catch (error) {
                alert('User denied account access...')
            }
        }

        else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider)
        }

        else {
            alert('Non-Ethereum browser detected. You should try Metamask')
        }

        window.web3Socket = new Web3(new Web3.providers.WebsocketProvider('ws://127.0.0.1:7545'));
    }

    loadBlockchainData = async () => {
        const web3 = window.web3
        const web3Socket = window.web3Socket
        const accounts = await web3.eth.getAccounts()
        const networkId = await web3.eth.net.getId()
        const networkData = loteryContract.networks[networkId]

        console.log(accounts)
        console.log('networkId', networkId)
        console.log('networkData', networkData)

        if (networkData) {
            const abi = loteryContract.abi
            const contractAddress = networkData.address
            const contract = new web3.eth.Contract(abi, contractAddress)
            const contractWebSocket = new web3Socket.eth.Contract(abi, contractAddress)
            const owner = await contract.methods.owner_address.call()
            const tokenAddress = await contract.methods.token_address.call()

            console.log('abi', abi)
            console.log('contractAddress', contractAddress)

            this.setState({ contract })
            this.setState({ contractWebSocket })
            this.setState({ contractAddress })
            this.setState({ account: accounts[0] })
            this.setState({ owner })
            this.setState({ tokenAddress })

            console.log('owner', this.state.owner)
            
            contractWebSocket.events.returned_tokens().on('data', (event) => {
                console.log(event)
            })

        } else {
            window.alert('Smart Contract NOT deployed on the net!')
        }
    }

    constructor(props) {
        super(props)

        this.state = {
            contract: null,
            contractWebSocket: null,
            account: "",
            contractAddress: "",
            owner: "",
            loading: false,
            errorMessage: "",
            tokenAddress: "",
            to_address: "",
            quantity: 0,
            balance_address: "",
            contract_balance: "",
            num_tokens: 0,
            tokens_return: 0
        }
    }

    buyTokens = async (to, quantity, price) => {
        try {
            const web3 = window.web3
            const accounts = await web3.eth.getAccounts()
            await this.state.contract.methods.BuyTokens(to, quantity).send({ from: accounts[0], value: price })
        } catch (error) {
            this.setState({ errorMessage: error.message })
        } finally {
            this.setState({ loading: false })
        }
    }

    balanceOf = async (address) => {
        try {
            return await this.state.contract.methods.BalanceOf(address).call()
        } catch (error) {
            this.setState({ errorMessage: error.message })
        } finally {
            this.setState({ loading: false })
        }
    }

    availableTokens = async () => {
        try {
            return await this.state.contract.methods.AvailableTokens().call()
        } catch (error) {
            this.setState({ errorMessage: error.message })
        } finally {
            this.setState({ loading: false })
        }
    }

    generateTokens = async (num_tokens) => {
        try {
            const web3 = window.web3
            const accounts = await web3.eth.getAccounts()
            await this.state.contract.methods.GenerateTokens(num_tokens).send({ from: accounts[0] })
        } catch (error) {
            this.setState({ errorMessage: error.message })
        } finally {
            this.setState({ loading: false })
        }
    }

    returnTokens = async (tokens_return) => {
        try {
            const web3 = window.web3
            const accounts = await web3.eth.getAccounts()
            await this.state.contract.methods.ReturnTokens(tokens_return).send({ from: accounts[0] })
        } catch (error) {
            this.setState({ errorMessage: error.message })
        } finally {
            this.setState({ loading: false })
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

                    <ul className="navbar-nav px-3">
                        <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
                            <small className="text-white"><span id="account">Active Account: {this.state.account}</span></small>
                        </li>
                        <li>
                            <small className="text-white"><span id="account">Owner Account: {this.state.owner}</span></small>
                        </li>
                        <li>
                            <small className="text-white"><span id="account">Token Address: {this.state.tokenAddress}</span></small>
                        </li>
                    </ul>
                </nav>
                <div className="container-fluid mt-5">
                    <div className="row">
                        <main role="main" className="col-lg-12 d-flex text-center">
                            <div className="content mr-auto ml-auto">

                                <h1>Lotery with Tokens ERC-20</h1>

                                <h2>Lotery Tokens Management and Control</h2>

                                <a href="https://www.linkedin.com/in/martin-santamaria/"
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <p> </p>
                                    <img src={tokens} width="450" height="400" alt="" />
                                </a>
                                <p> </p>

                                <h3> <Icon circular inverted color='red' name='dollar' /> Buy Tokens ERC-20</h3>

                                <form onSubmit={async (event) => {
                                    event.preventDefault()
                                    const to_address = this.to_address.value
                                    const quantity = this.quantity.value
                                    const price = await this.state.contract.methods.TokensPrice(quantity).call()
                                    //const web3 = window.web3
                                    //const ethers = web3.utils.toWei(quantity, 'ether')

                                    await this.buyTokens(to_address, quantity, price)
                                }
                                }>

                                    <input type="text"
                                        className='form-control mb-1'
                                        placeholder="Tokens address to"
                                        ref={(input) => this.to_address = input} />


                                    <input type="text"
                                        className='form-control mb-1'
                                        placeholder="Quantity"
                                        ref={(input) => this.quantity = input} />

                                    <input type="submit"
                                        className='btn btn-block btn-danger btn-sm'
                                        value='BUY TOKENS' />
                                </form>

                                <h3> <Icon circular inverted color='orange' name='bitcoin' /> User's Tokens Balance</h3>

                                <form onSubmit={async (event) => {
                                    event.preventDefault()
                                    const balance_address = this.balance_address.value
                                    this.balance.value = await this.balanceOf(balance_address)
                                }
                                }>

                                    <input type="text"
                                        className='form-control mb-1'
                                        placeholder="User's address"
                                        ref={(input) => this.balance_address = input} />
                                    <input type='text' className='form-control mb-1' disabled="disabled" placeholder="Balance" ref={(input) => this.balance = input} />
                                    <input type="submit"
                                        className='btn btn-block btn-warning btn-sm'
                                        value="USER'S BALANCE" />
                                </form>

                                <h3> <Icon circular inverted color='green' name='bitcoin' /> Smart Contract Tokens Balance</h3>

                                <form onSubmit={async (event) => {
                                    event.preventDefault()
                                    this.contract_balance.value = await this.availableTokens()
                                }
                                }>

                                    <input type='text' className='form-control mb-1' disabled="disabled" placeholder="Contract's balance" ref={(input) => this.contract_balance = input} />
                                    <input type="submit"
                                        className='btn btn-block btn-success btn-sm'
                                        value='BALANCE SMART CONTRACT' />
                                </form>

                                <h3> <Icon circular inverted color='blue' name='bitcoin' /> Increase Smart Contract's Tokens</h3>

                                <form onSubmit={async (event) => {
                                    event.preventDefault()
                                    const num_tokens = this.num_tokens.value
                                    await this.generateTokens(num_tokens)
                                }
                                }>

                                    <input type="text"
                                        className='form-control mb-1'
                                        placeholder="Tokens number"
                                        ref={(input) => this.num_tokens = input} />

                                    <input type="submit"
                                        className='btn btn-block btn-primary btn-sm'
                                        value='GENERATE TOKENS' />
                                </form>

                                <h3> <Icon circular inverted color='blue' name='ethereum' /> Return Tokens</h3>

                                <form onSubmit={async (event) => {
                                    event.preventDefault()
                                    const tokens_return = this.tokens_return.value
                                    await this.returnTokens(tokens_return)
                                }
                                }>

                                    <input type="text"
                                        className='form-control mb-1'
                                        placeholder="Tokens to return"
                                        ref={(input) => this.tokens_return = input} />

                                    <input type="submit"
                                        className='btn btn-block btn-primary btn-sm'
                                        value='RETURN TOKENS' />
                                </form>
                                <p></p>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        )
    }
}

export default Tokens;