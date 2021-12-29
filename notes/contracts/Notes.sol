// SPDX-License-Identifier: MIT
pragma solidity >= 0.4.4 < 0.7.0;
pragma experimental ABIEncoderV2;

// -----------------------------------
//  ALUMNO   |    ID    |      NOTA
// -----------------------------------
//  Marcos |    77755N    |      5
//  Joan   |    12345X    |      9
//  Maria  |    02468T    |      2
//  Marta  |    13579U    |      3
//  Alba   |    98765Z    |      5

contract Notes {
    
    // Teacher's address
    address public teacher;
    
    // Constructor
    constructor() public {
        teacher = msg.sender;
    }
    
    // Mapping that relates the student identity's hash with his exam's note 
    mapping (bytes32 => uint) notes;
    
    // Students' array for ones who ask for an exam revision
    mapping(string => string[]) revisions;
    
    // Events
    event student_evaluated(bytes32);
    event revision_asked(string);
    
    // Modifiers
    
    // Control of the functions that are executable by the teacher
    modifier OnlyTeacher(address _teacher) {
        // Requiers that the address entered by param be equal to the contract's owner
        require(teacher == _teacher, "Permission denied");
        _;
    }
    
    // Check that the student has been evaluated
    modifier StudentEvaluated(string memory _subject, string memory _student_id) {
        bytes32 student_id_hash = keccak256(abi.encodePacked(_subject, _student_id));
        uint student_note = notes[student_id_hash];
        
        require(student_note > 0, "The student has not been evaluated");
        _;
    }
    
    // Function to evaluate students
    function Evaluate(string memory _subject, string memory _id, uint _note) public OnlyTeacher(msg.sender) {
        // Student's Id hash
        bytes32 student_id_hash = keccak256(abi.encodePacked(_subject, _id));
        
        // Relation between the student's hash and his note
        notes[student_id_hash] = _note;
        
        // Emit the event
        emit student_evaluated(student_id_hash);
    }
    
    // Function to see a student's notes
    function SeeNotes(string memory _subject, string memory _student_id) public view StudentEvaluated(_subject, _student_id) returns(uint) {
        bytes32 student_id_hash = keccak256(abi.encodePacked(_subject, _student_id));
        
        // Asociated note to the student's hash
        uint student_note = notes[student_id_hash];
        
        return student_note;
    }
    
    // Function to ask for an exam's revision
    function Revision(string memory _subject, string memory _student_id) public StudentEvaluated(_subject, _student_id) {
        // Storage of the student's id in an array
        revisions[_subject].push(_student_id);
        
        // Emit the event
        emit revision_asked(_student_id);
    }
    
    // Function to see the students who have asked for an exam's revision
    function SeeRevisions(string memory _subject) public view OnlyTeacher(msg.sender) returns(string[] memory) {
        // Return the students' identities
        return revisions[_subject];
    }
}
