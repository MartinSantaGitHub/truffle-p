const notes = artifacts.require("Notes");

module.exports = function (deployer, network, accounts) {
  deployer.deploy(notes, {from: accounts[1]});
};