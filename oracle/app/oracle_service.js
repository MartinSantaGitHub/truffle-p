const Web3 = require('web3')
const Tx = require('ethereumjs-tx').Transaction
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const contractJson = require('../build/contracts/Oracle.json')
const web3 = new Web3('ws://127.0.0.1:7545')

const addressContract = '0xDbeB054532DBf50934F7Eb52d1E4f35caEA35afa'
const contractInstance = new web3.eth.Contract(contractJson.abi, addressContract)
const privateKey = Buffer.from('0b5ca1712229ba9a6781cd70247854ddd491cc1a528b8b0984c80dc850963bbb', 'hex')
const address = '0xED1b8f39266b5f73d556CE64ADA8c8079cEbc32e'

web3.eth.getBlockNumber()
    .then(n => listenEvent(n - 1))

function listenEvent(lastBlock) {
    contractInstance.events.__callbackNewData(
        {},
        {fromBlock: lastBlock, 
         toBlock: 'latest'}, 
        (err, event) => {
        event ? updateData() : null
        err ? console.log(err) : null
    })
}

function updateData() {
    const url = 'https://api.nasa.gov/neo/rest/v1/feed?start_date=2015-09-07&end_date=2015-09-08&api_key=DEMO_KEY'

    fetch(url)
        .then(response => response.json())
        .then(json => setDataContract(json.element_count))
}

function setDataContract(_value) {
    web3.eth.getTransactionCount(address, (err, txNum) => {
        contractInstance.methods.setNumberAsteroids(_value)
            .estimateGas({}, (err, gasAmount) => {
                let rawTx = {
                    nonce: web3.utils.toHex(txNum),
                    gasPrice: web3.utils.toHex(web3.utils.toWei('1.4', 'gwei')),
                    gasLimit: web3.utils.toHex(gasAmount),
                    to: addressContract,
                    value: '0x00',
                    data: contractInstance.methods.setNumberAsteroids(_value).encodeABI()
                }

                const tx = new Tx(rawTx)
                tx.sign(privateKey)
                const serializedTx = tx.serialize().toString('hex')
                web3.eth.sendSignedTransaction('0x' + serializedTx)
            })
    })
}