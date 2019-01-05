pragma solidity ^0.4.23;

contract vote {
    
    mapping (uint256 => address) idToCandidate;
    mapping (uint256 => uint256) candidateCount;
    mapping (address => bool) isVoted;
    
    
    event CreatElection(string _electionName);
    event CreatCandidate(uint256 _id, address _candidate);
    event Voting(address _voter, uint256 _id);
    event StartToVote(bool voteActived);
    event EndToVote(bool voteActived);
    
    string public  electionName;
    uint256 public startDate;
    uint256 public endDate;
    bool created = false;
    address private _owner = msg.sender;
    bool voteActive = false; 
    
    function owner()public view returns(address){
        return _owner;
    }
    
    function isOwner()public view returns(bool){
        return msg.sender == owner();
    }
  
  //

    
    function createElection(string _electionName)external{
        require(msg.sender == owner()," You are not owner");
        created = true;
        electionName = _electionName;
        emit CreatElection( _electionName);
    }
    
    function createCandidate(uint256 _id, address _candidate)external{
        require(created == true, "not create yet");
        require(msg.sender == owner(), "not owner");
        require(voteActive == false, "cannot create");
        require(idToCandidate[_id] == 0x0, "ID is used");
        idToCandidate[_id] = _candidate;
        
        emit CreatCandidate(_id, _candidate);
    }

    function voting(uint256 _id)external{
        require(voteActive == true, "too early");
        require(isVoted[msg.sender] != true, "has voted");
        uint256 amount = candidateCount[_id];
        amount += 1;
        candidateCount[_id] = amount;
        isVoted[msg.sender] = true;
        
        emit Voting(msg.sender, _id);
    }
    
    function getCount(uint256 _id)external view returns(uint256){
        require(msg.sender == owner(),"you are not owner");
        require(voteActive == false);
        return candidateCount[_id];
        
        
    }
    
    function getCandidate(uint256 _id)external view returns(address){
        return idToCandidate[_id];
        
        
    }
    
    function  getCurrentTimestamp() internal view returns (uint256) {
        return now;
    }
    
    
    function  getCurrentTime()external view returns (uint256) {
        return now;
        
        
    }
    
    function startToVote()external{
        require(msg.sender == owner(),"you are not owner");
        voteActive = true;
        emit StartToVote(voteActive);
    }
    
    function endToVote()external{
        require(msg.sender == owner(),"you are not owner");
        voteActive = false;
        emit EndToVote(voteActive);
    }
    
    
   
    function getName() public view returns(string){
        return electionName;
        
        
    }
    
    
    //"p", 1546591750,1546617600
    //1,"0x14723a09acff6d2a60dcdf7aa4aff308fddc160c"
    //2,"0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db"
    //1546617600
    
    
}
