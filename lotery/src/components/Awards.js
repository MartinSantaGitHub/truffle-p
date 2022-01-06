import React, { Component } from "react";
import './App.css';
import Web3 from "web3";
import loteryContract from '../abis/Lotery.json';
import { Icon } from "semantic-ui-react";
import winner from '../images/winner.png';

class Awards extends Component {
    componentWillMount = async () => {
        await this.loadWeb3()
        await this.loadBlockchainData()
    }

    componentWillUnmount = () => {
        this.state.contractWebSocket.events.winner_ticket().off('data')
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

            contractWebSocket.events.winner_ticket().on('data', (event) => {
                this.setState((prevState) => ({ ...prevState, winner: event.returnValues.winner }))
            })

            contractWebSocket.events.returned_not_played_tokens().on('data', (event) => {
                alert('Not played tokens returned!!!')
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
            account: null,
            contractAddress: null,
            owner: null,
            loading: false,
            errorMessage: null,
            tokenAddress: null,
            winner: ''
        }
    }

    generateWinner = async (uniquePersons) => {
        try {
            const web3 = window.web3
            const accounts = await web3.eth.getAccounts()
            await this.state.contract.methods.GenerateWinner(uniquePersons).send({ from: accounts[0] })
        } catch (error) {
            this.setState({ errorMessage: error.message })
        } finally {
            this.setState({ loading: false })
        }
    }

    getWinner = async () => {
        try {
            return await this.state.contract.methods.GetWinner().call()
        } catch (error) {
            this.setState({ errorMessage: error.message })
        } finally {
            this.setState({ loading: false })
        }
    }

    returnNotPlayedTokens = async (uniquePersons) => {
        try {
            const web3 = window.web3
            const accounts = await web3.eth.getAccounts()
            await this.state.contract.methods.ReturnNotPlayedTokens(uniquePersons).send({ from: accounts[0] })
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

                                <h2>Lotery Awards</h2>

                                <a href="https://www.linkedin.com/in/martin-santamaria/"
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <p> </p>
                                    <img src={winner} width="400" height="400" alt="" />
                                </a>
                                <p> </p>

                                <h3> <Icon circular inverted color='red' name='winner' /> Generate Winner</h3>

                                <form onSubmit={async (event) => {
                                    event.preventDefault()
                                    const persons = await this.state.contract.methods.GetPersons().call()
                                    const uniquePersons = [...new Set(persons)]
                                    //const isPersonsEnough = uniquePersons.length > 1
                                    //console.log('isPersonsEnough', uniquePersons)
                                    await this.generateWinner(uniquePersons)
                                }
                                }>

                                    {/* <input type='text' className='form-control mb-1' disabled="disabled" ref={(input) => {this.winner = input}} /> */}
                                    <input type="submit"
                                        className='btn btn-block btn-danger btn-sm'
                                        value='GENERATE WINNER' />
                                </form>

                                <h3> <Icon circular inverted color='yellow' name='winner' /> See Winner</h3>

                                <form onSubmit={async (event) => {
                                    event.preventDefault()
                                    const winner_address = await this.state.contract.methods.GetWinner().call()

                                    if (winner_address !== '0x0000000000000000000000000000000000000000') {
                                        console.log(winner_address)
                                        this.setState((prevState) => ({ ...prevState, winner: winner_address }));
                                    }
                                }
                                }>
                                    <input type='text' className='form-control mb-1' disabled="disabled" value={this.state.winner} />
                                    <input type="submit"
                                        className='btn btn-block btn-info btn-sm'
                                        value='SEE WINNER' />
                                </form>

                                <h3> <Icon circular inverted color='yellow' name='bitcoin' /> Return Not Played Tokens</h3>
                                
                                <form onSubmit={async (event) => {
                                    event.preventDefault()
                                    const persons = await this.state.contract.methods.GetPersons().call()
                                    const uniquePersons = [...new Set(persons)]
                                    await this.returnNotPlayedTokens(uniquePersons)
                                }
                                }>

                                    {/* <input type='text' className='form-control mb-1' disabled="disabled" ref={(input) => {this.winner = input}} /> */}
                                    <input type="submit"
                                        className='btn btn-block btn-warning btn-sm'
                                        value='RETURN NOT PLAYED TOKENS' />
                                </form>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        )
    }
}

export default Awards;