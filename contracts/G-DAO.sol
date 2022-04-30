// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @author Team-G
/// @title A voting platform
contract Elect is Ownable {

  constructor() {
    Holders[msg.sender] = true;
    Dead = block.timestamp;
    Chairman = msg.sender;
  }
    
  /// @notice A record for validity of candidate
  mapping(uint256 => bool) Candidate;

  /// @notice The number of votes received per candidate
  mapping (uint256 => uint256) private votesReceived;

  /// @notice A record of accounts declaring interest
  mapping(address => bool) Interest;

  /// @notice A record of accounts that have Voted
  mapping(address => bool) Voted;

  /// @notice The addresses with access to voting
  mapping(address => bool) private Holders;

  /// @notice A record of addresses assigned as teachers
  mapping (address => bool) private Teacher;

  /// @notice A record of addresses assigned as directors
  mapping (address => bool) private Director;

  /// @notice  An official record of Contestant information
  mapping (uint256 => Candid) Contestant;

  ///@notice mapping of students
  mapping (address => bool) Student;

  /// @notice Address of the Chairman of the organisation.
  address Chairman;

  /// @notice A list of stakeholders addresses
  address[] stakeholders;

  /// @notice The phase of election, initialised as 0
  uint8 private electionPhase = 0;

  /// @notice The number of candidates. Initialised as 0
  uint256 count = 0;

  /// @notice Time to stop a function
  uint256 Dead;

  /// @notice A list of positions 
  string[] Position;

  /// @notice A list of candidates for the election
  string[] public candidateList;

  function getList() public view returns(string[] memory) {
    return candidateList;
  }

  /// @notice states the details of a candidate
  struct Candid
  {
      uint256 ID;
      string name;
      string position;
      string ipfs;
  }

  /**
   * @notice An event thats emitted to show the result of the election
   * @dev the Candid parameter will be a struct representing a Contestant
   * @param candid candidate contesting
   * @param votes total number of votes
   * @param date date election result
   */
  event result(Candid candid, uint256 votes, bytes32 date);

  /// @notice An event thats emitted to show the details of the candidates 
  event candidates(uint256 ID, string name, string position, string ipfs);

  event Approved(uint256 ID, string name, string position, string ipfs);

  /// @notice This checks that the address is a stakeholder
  modifier stakeholder {
    require(Holders[msg.sender] == true, "You are not a stakeholder");
    _;
  }

  /// @notice Modifier to Start the voting process
  modifier startvoting
  {
    require(electionPhase == 3,"Its not yet time to vote");
    _;
  }

  /// @notice Moderator to control access to the smart contract
  modifier controlAccess{
    require(block.timestamp >= Dead,"contract is disabled");
    _;
  }

  /**
   * @notice function allows Chairman to enable contract
   */
  function enable() public {
      require (msg.sender == Chairman,"You are not the Chairman");
      Dead = block.timestamp;
  }

  /**
   * @notice function allows Chairman to disable contract
   */
  function disable() public {
    require(msg.sender == Chairman,"You are not the Chairman");
    Dead = block.timestamp + 366 days;
  }

  /**
   * @notice function allows Chairman Start voting proccess
   */
  function beginVote()public controlAccess
  {
    require(electionPhase == 2, "Not yet time");
    require(msg.sender== Chairman,"you're not the Chairman");
    electionPhase = 3;
  }

  /**
   * @notice function allows Chairman end voting proccess
   */
  function endVote()public controlAccess
  {
    require(electionPhase == 3, "You must first begin vote");
    require(msg.sender==Chairman,"you're not the Chairman ");
    electionPhase = 4;
  }

  function startDeclaration() public controlAccess
  {
    require(electionPhase == 0, "Can not commence declaration at this phase");
    require(msg.sender==Chairman,"you're not the Chairman ");
    electionPhase = 1;
  }

  function endDeclaration() public controlAccess
  {
    require(electionPhase == 1, "Can not end declaration at this phase. Ensure declaration is commenced first, or that election has not exceeded this phase");
    require(msg.sender==Chairman,"you're not the Chairman ");
    electionPhase = 2;
  }

  /**
   * @notice Set Chairman for the electoral process by the owner only
   * @param _chairman The address of the Chairman
   */
  function setChairman(address _chairman) public {
    require(msg.sender == Chairman, "You are not the chairman");
    Chairman = _chairman;
    Holders[_chairman]=true;
    Director[msg.sender] = true;
    
  }
  
  /**
   * @notice Adds an array of student to have access as a stakeholder
   * @notice Adds an array of Teacher to have access as a stakeholder
   * @notice Adds an array of Director to have access as a stakeholder
   * @param addresses The address to be given roles
   * @param accountTypes array of the account type
   */   
   function addStakeholders(address[] calldata addresses, string[] calldata accountTypes) external controlAccess {
     stakeholders = addresses;
     require(msg.sender == Chairman || owner() == _msgSender());
     require(addresses.length == accountTypes.length, "the roles and addresses provided differ");     
     for (uint i = 0; i < addresses.length; i++) {
        if (keccak256(abi.encodePacked(accountTypes[i])) == keccak256(abi.encodePacked('Student'))) {
          Student[addresses[i]] = true;
          Holders[addresses[i]] = true;
        } else if (keccak256(abi.encodePacked(accountTypes[i])) == keccak256(abi.encodePacked('Teacher'))) {
          Teacher[addresses[i]]=true;
          Holders[addresses[i]] = true;
        } else if (keccak256(abi.encodePacked(accountTypes[i])) == keccak256(abi.encodePacked('Director'))) {
          Director[addresses[i]]=true;
          Holders[addresses[i]] = true;
        } else {
          continue;
      }
    }
  }

  /**
   * @notice Creates an array of position for the voting process
   * @param _position The positions to be created
   */
  function createPosition(string[] memory _position) public controlAccess {
    require(msg.sender == Chairman && electionPhase == 0);
    Position = _position;
  }

  /**
   * @notice Stakeholders declare interests for positions
   * @param candidate The name of the candidate
   * @param position The position the candidate is vying for
   * @param link The ipfs link containing the image of the candidate
   */
  function declareInterest(string memory candidate,uint position, string memory link) public controlAccess
  {
    require(Holders[msg.sender] == true && msg.sender != Chairman && Interest[msg.sender] == false && electionPhase == 1);

    require(position <= Position.length && position > 0, "You have sent in an inexistent post");
    

    Interest[msg.sender] = true;
    uint256 Count=count + 1;
    count++;
    candidateList.push(candidate);
    Candidate[Count]=true;
    votesReceived[Count]=0;
    Contestant[Count]=Candid(Count, candidate, Position[position - 1], link );
    emit candidates(Count, candidate, Position[position - 1], link);
  }

  /**
   * @notice this function deletes candidates that are unqualified
   * @notice it checks if the user is the Chairman
   * @param candidate The id of the candidate
   */
  function approveCandidates(uint256[] calldata candidate)public controlAccess
  {
    require(msg.sender==Chairman, "must be Chairman");
    require(electionPhase == 2);
    for (uint i = 0; i < candidate.length; i++) {
      emit Approved(Contestant[i + 1].ID, Contestant[i + 1].name, Contestant[i + 1].position, Contestant[i + 1].ipfs);
    }
    
  }



  /**
   * @notice this function collects the candidates name, checks if it exists then counts a vote for said candidate
   * @param candidate The name of the candidate
  */
  function voteCandidate(uint256[] calldata candidate) external controlAccess startvoting returns(bytes32){

    require(Voted[msg.sender]==false,"You cant vote twice");

    /// @dev Make sure the candidate exists
    for(uint256 i = 0; i<candidate.length;i++)
    {
    require(Candidate[candidate[i]] == true, "Someone is not a candidate");   
     votesReceived[candidate[i]] += 1;
    }
    Voted[msg.sender]= true;
    return "Voted";
  }

  /**
   * @notice this function returns the number of votes of a candidate
   * @notice it checks if the user is the Chairman or a Teacher
   * @dev the uint value of votesReceived is converted to string and returned with bstr
   * @param candidate The name of the candidate
  */
  function candidateVotes(uint256 candidate) public controlAccess view returns (string memory) {
   if (msg.sender==Chairman || Teacher[msg.sender]==true)
   {

     /// @dev Make sure the candidate exists
    require(Candidate[candidate] == true, "This is not a candidate");

    bytes memory bstr = new bytes(votesReceived[candidate]);
    return string(bstr);
   }else 
   {
    return "You dont have access to this function";
   }
  }

  /**
   * @notice this function checks if the candidate exists
    * @dev hashed the name in candidate list and compared it with the hash of candidate using keccak256
       this is because solidity does'nt compare two string types with ==
   * @param candidate The name of the candidate 
   * @return Whether or not the candidate exists
   */
  function checkCandidate(string memory candidate) public view controlAccess returns (bool) {
    for(uint i = 0; i < candidateList.length; i++) {
      if (keccak256(abi.encodePacked(candidateList[i])) == keccak256(abi.encodePacked(candidate))) {
        return true;
      }
    }
    return false;
  }
   
  /**
   * @notice function allows Stakeholders except students to make result visible to all
   */
  function publicResults(bytes32 date)public controlAccess
  {
    require(Student[msg.sender] != true);
    require(electionPhase == 2,"voting has to end first");
    for(uint256 i=1; i<=count; i++)
    {
      emit result (Contestant[i], votesReceived[i], date);
    }
    electionPhase = 3;

  }

  function getElectionPhase() public view returns(uint256) {
    // electionPhase is 0 before voting starts
    // electionPhase is 1 when voting starts
    // electionPhase is 2 when voting has been concluded
    // electionPhase is 3 when results are published
    return electionPhase;
  }

  function hasDeclared(address user) public view returns(bool) {
    return Interest[user];
  }

  function hasVoted(address user) public view returns(bool) {
    return Voted[user];
  }

  function getAvailablePosts() public view returns(string[] memory) {
    return Position;
  }


   /// @notice from here on contains functions for the login at the front end
  function login(address user)public view returns(string memory)
  {
     ///@notice Chairman login
    if(user==Chairman)
    {
      return "Chairman";
    }
     ///@notice other teachers login
    else if(Teacher[user]==true)
    {
      return "Teacher";
    }
    ///@notice other directors login
    else if(Director[user]==true)
    {
      return "Director";
    }
   ///@notice students login
    else if(Student[user]==true)
    {
      return "Student";
    }
    return "Not Authorised";
  }

  function contractstate()public view returns(bool)
  {
    return block.timestamp > Dead;
  }

   /// @notice this functions clears the contents of the previously performed election so it can be reused
  function clearData()public
  {
    require(msg.sender == Chairman,"no access");

    for(uint256 i = 1; i <= count; i++)
    {
      delete Candidate[i];
      delete Contestant[i];
      delete votesReceived[i];
    }
    count=0;
    
    for (uint256 i=0; i<candidateList.length; i++)
    {
      delete candidateList[i];
    } 

    for(uint256 i = 0; i<stakeholders.length;i++)
    {
      delete stakeholders[i];
      Voted[stakeholders[i]] = false;
    }  
    Voted[Chairman] = false;   
    electionPhase = 0;  
  }
}
