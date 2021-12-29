const { assert } = require("chai");

const Main = artifacts.require('Main');

contract('Main', accounts => {
    let contract = undefined

    before(async () => {
        contract = await Main.deployed()
    })

    it('Function: getOwner()', async () => {
        const ownerAddress = await contract.getOwner.call()
        assert.equal(accounts[2], ownerAddress)
    })

    it('Function: sendTokens(address to, uint numTokens)', async () => {
        let amount = 10
        balance = await contract.balance.call(accounts[0])
        contractBalance = await contract.balanceAll.call()

        assert.equal(balance, 0)
        
        await contract.sendTokens(accounts[0], amount, {from: accounts[1]})
        
        newBalance = await contract.balance.call(accounts[0])
        newContractBalance = await contract.balanceAll.call()
        account1Balance = await contract.balance.call(accounts[1])
        
        assert.equal(newBalance, amount)
        assert.equal(newContractBalance, contractBalance - amount)
        assert.equal(account1Balance, 0)
    })
})