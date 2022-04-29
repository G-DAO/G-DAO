import { useState, useEffect } from 'react';
import Voting from './Voting';
import ResultSummary from './ResultSummary';
import AdminPage from './AdminPage';

const VotingPage = ({posts, candidatesByPost, isResultView, isAdminView, resultsCompiled, contract, address, accountType}) => {
    const [votes, setVotes] = useState([]);
    const [toBeApproved, setToBeApproved] = useState([])
    const [noOfVotes, setNoOfVotes] = useState(0);


    const setVoters = (name, checker) => {
        checker ? setVotes([...votes, Number(name)]) : setVotes(votes.filter(t => t !== Number(name)));
        console.log(votes)
    }

    const setApprovedCandidates = (name, checker) => {
        checker ? setToBeApproved([...toBeApproved, Number(name)]) : setVotes(toBeApproved.filter(t => t !== Number(name)));
        console.log(toBeApproved)
    }

    const handleSubmitVotes = async () => {
        if (votes.length < posts.length) {
            alert('You have not voted all categories.')
            return;
        }
        console.log(votes);

        try {
            await contract.methods.voteCandidate(votes).send({from : address})
            alert('Votes Sent');
            
            setVotes([])
        } 
        catch (error) {
			alert(error);
		}
    }

    const handleApproveCandidates = async () => {
        if (votes.length < posts.length) {
            alert('You have not voted all categories.')
            return;
        }
        console.log(votes);

        try {
            await contract.methods.approveCandidates(toBeApproved).send({from : address})
            alert('Votes Sent');
            
            setVotes([])
        } 
        catch (error) {
			alert(error);
		}
    }

    useEffect(() => {
        if (isResultView) {
            let sum_ = candidatesByPost.reduce((acc, curr) => acc + curr.votesCount, 0);
            setNoOfVotes(sum_/posts.length);
            
        }
    }, [candidatesByPost, isResultView])

    return (
        <>

        <div className= "voting-page">
            <h1>
                {isResultView ? 'Election Results' : (isAdminView ? 'All Candidates' : 'Elections are Live')}
            </h1>
            {!isAdminView && <p> {isResultView ? 'View the results of the just concluded elections below' :
            'Select your choice candidate from the different categories. Note that you can only vote one candidate per category.'}</p>}

            {isResultView && <ResultSummary numOfPosts= {posts.length} amountOfVotes = {noOfVotes} candidPerPost = {Math.round(noOfVotes/posts.length)} />}

            {posts.map((post, index) => {
                let candidates = candidatesByPost.filter(t => t.position === post).sort((a, b) => {
                    if(isResultView) return b.votesCount - a.votesCount;
                    return 0;
                })
                console.log(candidates)
                return (
                    < Voting post = {post} candidates = {candidates} handleVote = {setVoters} isResultView = {isResultView} isAdminView = {isAdminView} resultsCompiled= {resultsCompiled}
                    handleApproval= {setApprovedCandidates} accountType= {accountType} />
                )
            })}


            
            {!isResultView && (!isAdminView ? <button onClick= {handleSubmitVotes} className= "button-auth">Send Votes</button> : 
            (accountType === 'Chairman' && <button onClick= {handleApproveCandidates} className= "button-auth">Approve</button>))}
        </div>
        </>
        
    )
}

AdminPage.defaultProps = {
    isResultView: false,
    isAdminView: false,
    resultsCompiled: true,
    accountType: ''
}

export default VotingPage