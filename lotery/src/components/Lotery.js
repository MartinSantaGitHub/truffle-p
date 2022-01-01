import React, { Component } from "react";
import './App.css';
import Web3 from "web3";
import loteryContract from '../abis/Lotery.json';
import { Icon } from "semantic-ui-react";
import lotery from '../images/lotery.png';

class Lotery extends Component {
    componentWillMount = async () => {
        await this.loadWeb3()
        await this.loadBlockchainData()
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
    }

    loadBlockchainData = async () => {
        const web3 = window.web3
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
            const owner = await contract.methods.owner_address.call()
            const tokenAddress = await contract.methods.token_address.call()

            console.log('abi', abi)
            console.log('contractAddress', contractAddress)

            this.setState({ contract })
            this.setState({ contractAddress })
            this.setState({ account: accounts[0] })
            this.setState({ owner })
            this.setState({ tokenAddress })

            console.log('owner', this.state.owner)

        } else {
            window.alert('Smart Contract NOT deployed on the net!')
        }
    }

    constructor(props) {
        super(props)

        this.state = {
            contract: null,
            account: null,
            contractAddress: null,
            owner: null,
            loading: false,
            errorMessage: null,
            tokenAddress: null,
            tickets_quantity: null
        }
    }

    tokensBucket = async () => {
        try {
            return await this.state.contract.methods.TokensBucket().call()
        } catch (error) {
            this.setState({ errorMessage: error.message })
        } finally {
            this.setState({ loading: false })
        }
    }

    ticketPrice = async () => {
        try {
            return await this.state.contract.methods.ticket_price().call()
        } catch (error) {
            this.setState({ errorMessage: error.message })
        } finally {
            this.setState({ loading: false })
        }
    }

    buyTickets = async (ticketsNumber) => {
        try {
            const web3 = window.web3
            const accounts = await web3.eth.getAccounts()
            await this.state.contract.methods.BuyTickets(ticketsNumber).send({ from: accounts[0] })
            alert('Good Luck!')
        } catch (error) {
            this.setState({ errorMessage: error.message })
        } finally {
            this.setState({ loading: false })
        }
    }

    myTickets = async () => {
        try {
            const web3 = window.web3
            const accounts = await web3.eth.getAccounts()
            return await this.state.contract.methods.MyTickets().call({ from: accounts[0] })
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

                                <h2>Lotery Tickets Management and Control</h2>

                                <a href="https://www.linkedin.com/in/martin-santamaria/"
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <p> </p>
                                    <img src={lotery} width="500" height="350" alt="" />
                                </a>
                                <p> </p>

                                <h3> <Icon circular inverted color='blue' name='eye' /> Tokens Bucket</h3>

                                <form onSubmit={async (event) => {
                                    event.preventDefault()
                                    this.tokens_bucket.value = await this.tokensBucket()
                                }
                                }>

                                    <input type='text' className='form-control mb-1' disabled="disabled" ref={(input) => this.tokens_bucket = input} />
                                    <input type="submit"
                                        className='btn btn-block btn-primary btn-sm'
                                        value='TOKENS BUCKET' />
                                </form>

                                <h3> <Icon circular inverted color='orange' name='money bill alternate outline' /> Ticket Price</h3>

                                <form onSubmit={async (event) => {
                                    event.preventDefault()
                                    this.ticket_price.value = await this.ticketPrice()
                                }
                                }>

                                    <input type='text' className='form-control mb-1' disabled="disabled" ref={(input) => this.ticket_price = input} />
                                    <input type="submit"
                                        className='btn btn-block btn-info btn-sm'
                                        value='TICKET PRICE' />
                                </form>

                                <h3> <Icon circular inverted color='yellow' name='payment' /> Buy Tickets</h3>

                                <form onSubmit={async (event) => {
                                    event.preventDefault()
                                    const quantity = this.tickets_quantity.value
                                    await this.buyTickets(quantity)
                                }
                                }>

                                    <input type='text' className='form-control mb-1' placeholder="Tickets quantity" ref={(input) => this.tickets_quantity = input} />
                                    <input type="submit"
                                        className='btn btn-block btn-warning btn-sm'
                                        value='BUY TICKETS' />
                                </form>

                                <h3> <Icon circular inverted color='red' name='money bill alternate outline' /> My Tickets</h3>

                                <form onSubmit={async (event) => {
                                    event.preventDefault()
                                    const my_tickets = await this.myTickets()
                                    console.log(my_tickets)
                                    this.my_tickets.value = my_tickets
                                }
                                }>

                                    <input type='text' className='form-control mb-1' disabled="disabled" ref={(input) => this.my_tickets = input} />
                                    <input type="submit"
                                        className='btn btn-block btn-info btn-sm'
                                        value='MY TICKETS' />
                                </form>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        )
    }
}

export default Lotery;