
import { FaAngleDoubleDown, FaAngleDoubleUp } from 'react-icons/fa';
import { useState } from 'react';
import Candidate from './Candidate';


const Voting = ({post, candidates, handleVote, electionPhase, isAdminView, resultsCompiled, handleApproval, accountType}) => {
    const [showContestants, setShowContestants] = useState(true);
    const [hasVoted, setHasVoted] = useState(false);
    let maxVotes = electionPhase === 5 && candidates[0].votesCount;

    // check that category has been voted for
    const checkVoted = (name, checker) => {
        if (checker && hasVoted) {
            alert("You cant vote two candidates in the same category. Unvote your previous selection")
            return;
        }
        handleVote(name, checker)
        setHasVoted(checker);
        
    }

    
    return (
        <div className = "voting-bar">
            <div className= "voting-bar-header">
                <h2>{post}</h2>
                {showContestants ? < FaAngleDoubleUp onClick= {() => setShowContestants(false)} />
                : < FaAngleDoubleDown onClick= {() => setShowContestants(true)} />}
            </div>
            {showContestants && (candidates.length > 0 ? <div className= "candidate-view">
                {candidates.map((candidate, index) => {
                    return (<div key = {index}>
                        < Candidate student = {candidate} handleVote = {checkVoted} number = {index + 1} votedforCategory= {hasVoted} electionPhase= {electionPhase} 
                        isWinner = {resultsCompiled && candidate.votesCount===maxVotes}
                        isAdminView = {isAdminView}
                        handleApproval = {handleApproval}
                        accountType= {accountType} />
                    </div>)
                    
                })}
            </div> : <p>No Candidate available for this post</p>)}
            

        </div>
        
    )
}

export default Voting;