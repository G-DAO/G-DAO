// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @author Team-G
/// @title A voting platform
contract Elect is Ownable {

  constructor() {
    Holders[msg.sender] = true;
    Dead = block.timestamp;
  }
    
  /// @notice A record for validity of candidate
  mapping(uint256 => bool) Candidate;

  /// @notice The number of votes received per candidate
  mapping (uint256 => uint256) private votesReceived;

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

  /// @notice A list of candidates for the election
  string[] public candidateList;

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
   * @param Candid candidate contesting
   * @param votes total number of votes
   */
  event result(Candid Candid, uint256 votes);

  /// @notice An event thats emitted to show the details of the candidates 
  event candidates(uint256 ID, string name, string position, string ipfs);

  /// @notice This checks that the address is a stakeholder
  modifier stakeholder {
    require(Holders[msg.sender] == true, "You are not a stakeholder");
    _;
  }

  /// @notice Modifier to Start the voting process
  modifier startvoting
  {
    require(electionPhase == 1,"Its not yet time to vote");
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
    require(msg.sender== Chairman,"you're not the Chairman");
    electionPhase = 1;
  }

  /**
   * @notice function allows Chairman end voting proccess
   */
  function endVote()public controlAccess
  {
    require(electionPhase == 1, "You must first begin vote");
    require(msg.sender==Chairman,"you're not the Chairman ");
    electionPhase = 2;
  }

  /**
   * @notice Set Chairman for the electoral process by the owner only
   * @param _chairman The address of the Chairman
   */
  function setChairman(address _chairman) public onlyOwner {
    Chairman = _chairman;
    Holders[_chairman]=true;
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
   * @notice this function adds a candidate to the contract
   * @notice it checks if the user is the Chairman
   * @param candidate The name of the candidate
   * @param position The position the candidate is vying for
   * @param link The ipfs link containing the image of the candidate
   */
  function addCandidate(string memory candidate,string memory position, string memory link)public controlAccess
  {
    require(msg.sender==Chairman, "must be Chairman");
    require(electionPhase == 0);
    uint256 Count=count + 1;
    count++;
    candidateList.push(candidate);
    Candidate[Count]=true;
    votesReceived[Count]=0;
    Contestant[Count]=Candid(Count, candidate, position, link );
    emit candidates(Count, candidate, position, link);
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
  function publicResults()public controlAccess
  {
    require(Student[msg.sender] != true);
    require(electionPhase == 2,"voting has to end first");
    for(uint256 i=1; i<=count; i++)
    {
      emit result (Contestant[i], votesReceived[i]);
    }
    electionPhase = 3;

  }

  function getElectionPhase() public view returns(uint256) {
    return electionPhase;
  }


/// @notice from here on contains functions for the login at the front end

   ///@notice Chairman login
  function login(address user)public view returns(string memory)
  {
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

