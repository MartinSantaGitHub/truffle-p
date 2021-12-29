// Llamada al contrato
const notes = artifacts.require('Notes');

contract('Notes', accounts => {

    it('1. Function Evaluate(string memory _subject, string memory _id, uint _note)', async () => {
        // Smart Contract Deployed
        let instance = await notes.deployed();
        const tx1 = await instance.Evaluate('Bio', '12345X', 9, {from: accounts[1]});
        const tx2 = await instance.Evaluate('Math', '02468T', 5, {from: accounts[1]});
        const tx3 = await instance.Evaluate('Bio', '02468T', 7, {from: accounts[1]});
        console.log(accounts[0]);
        console.log(tx1);
        const student_note0 = await instance.SeeNotes.call('Bio', '12345X', {from: accounts[3]});
        const student_note1 = await instance.SeeNotes.call('Bio', '02468T', {from: accounts[3]});
        const student_note2 = await instance.SeeNotes.call('Math', '02468T', {from: accounts[4]});
        console.log(student_note1);
        assert.equal(student_note0, 9);
        assert.equal(student_note1, 7);
        assert.equal(student_note2, 5);
    });

    it('2. Function Revision(string memory _subject, string memory _id)', async () => {
        let instance = await notes.deployed();
        const rev1 = await instance.Revision('Bio', '12345X', {from: accounts[3]});
        const rev2 = await instance.Revision('Bio', '02468T', {from: accounts[3]});
        const rev3 = await instance.Revision('Math', '02468T', {from: accounts[2]});
        console.log(rev1);
        console.log(rev2);
        console.log(rev3);
        const revsA = await instance.SeeRevisions.call('Bio', {from: accounts[1]});
        const revsB = await instance.SeeRevisions.call('Math', {from: accounts[1]});
        console.log(revsA);
        console.log(revsB);
        assert.equal(revsA[0], '12345X');
        assert.equal(revsA[1], '02468T');
        assert.equal(revsB[0], '02468T');
    });
});