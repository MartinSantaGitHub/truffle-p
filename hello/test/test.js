const Hello = artifacts.require("Hello");

contract('Hello', accounts => {

    it('Get Message', async () => {
        let instance = await Hello.deployed();
        const message = await instance.GetMessage.call({from: accounts[0]});
        assert.equal(message, 'Hi World!'); 
    });

    it('Change Message', async () => {
        let instance = await Hello.deployed();
        const tx = await instance.SetMessage('Santa', {from: accounts[1]});

        console.log(accounts);
        console.log(accounts[1]);
        console.log(tx);

        const msg = await instance.GetMessage.call();
        assert.equal(msg, 'Santa');
    });
});