import { useState } from 'react';
import * as ipfsClient from 'ipfs-http-client';
import VotingPage from './VotingPage';


const AdminPage = ({contract, startVote, endVote, accountType, address, enableContract, disableContract, contractLive, votingOccuring, candidates, posts, sendCandidatesData, setPage}) => {

    const [newAdmin, setNewAdmin] = useState('')
    const [newChairman, setNewChairman] = useState('')
    const [candidateName, setCandidateName] = useState('')
    const [position, setPosition] = useState('')
    const [picture, setPicture] = useState(null)
    const [lastCandidateID, setLastCandidateID] = useState(candidates.length);
    const [electionPhase, setElectionPhase] = useState(0)
    const [posts_, setPosts_] = useState(posts)

    const [viewCandidates, setViewCandidates] = useState(false)
    const [currentView, setCurrentView] = useState(contractLive ? 0 : 4)
    const [viewResults, setViewResults] = useState(false)
    const [file, setFile] = useState()
    const [accountType_, setAccountType_] = useState('')
    const create = ipfsClient.create;
	const client = create(`https://ipfs.infura.io:5001/api/v0`);
    const fileReader = new FileReader();
    const views = ['Whitelisting', `${electionPhase <= 5 ? 'View Candidates' : 'View Results'}`, 'Set Vote Time', 'Hand Over', 'Advanced'];


    const handleStartVote = () => {
        if (candidates.length === 0) {
            alert('Voting can not start without candidates')
        }
        console.log('Started Voting season');
        startVote();
    }

    const handleEndVote = () => {
        console.log('Ended Voting season');
        endVote();
    }

    const handleAddAdmin = () => {
        console.log(newAdmin);
        setNewAdmin('');
    }

    const changeChairman = async () => {
        try {
            const res = await contract.methods.setChairman(newChairman).send({from: address})
            alert("Chairman changed. You would have to log in again")
            setPage('login')
        } 
        catch (error) {
            alert(error);
        }
    }

    const refreshContract = async () => {
        try {
            const res = await contract.methods.clearData().send({from: address})
            alert("Contract Data refreshed")
        } 
        catch (error) {
            alert(error);
        } 
    }

    const getType = async () => {
        if(!newAdmin) {alert('Enter a valid address'); return;}
        try {
            const res = await contract.methods.login(newAdmin).call()
            setAccountType_(res);
        } 
        catch (error) {
            alert(error);
        } 
    }


    const handleAddStakeholders = async (e) => {
        e.preventDefault();

        let res = [];
        let roles = [];
        if (file) {
            console.log(file)
            fileReader.onload = async function (event) {
                const csvOutput = event.target.result;
                let lines = csvOutput.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    let p = lines[i].split(',');
                    res.push(p[0]);
                    roles.push(p[1].split('\r')[0]);
        
                }
        
                console.log({res, roles})

                if (res.length === roles.length && res.length > 0) {
                    try {
                        await contract.methods.addStakeholders(res, roles).send({from : address})
                        alert('Added Stakeholders');	
                        console.log('Added Candidate')
                    } 
                    catch (error) {
                        alert(error);
                    } 
                } else alert("The number of addresses you sent do not match the number of roles. Check your file and try again.")

            };
            fileReader.readAsText(file);
        } 
    }

    const handleStartDeclaration = async () => {
        if (electionPhase > 0) {
            alert('You can not start Interest Declaration now. Election has gone beyond this phase');
            return;
        }
        setElectionPhase(1);
        console.log('Started Declare');
    }

    const handleEndDeclaration = async () => {
        if (electionPhase > 1) {
            alert('You can not start Interest Declaration now. Election has gone beyond this phase');
            return;
        }
        if (electionPhase < 1) {
            alert('You have not started interest declaration yet, so it can not be ended.');
            return;
        }
        setElectionPhase(2);
        console.log('Ended Declare');
    }

    const handleCreatePost = async () => {
        if (electionPhase > 0) {
            alert('You can not create a post after election period has been started. Election has gone beyond this phase');
            return;
        }
        setPosts_([...posts_, position])
        console.log('Post Created');
    }

    const handlePublishResults = async () => {
        try {
            await contract.methods.publicResults().send({from : address})
            alert('Results set to Published');	
            console.log('Added Candidate')
        } 
        catch (error) {
            const p = {error}
			alert(p.error.message);
            console.log(p.error.message);
		} 
    }


    const handleAddCandidate = async () => {
        if (picture === null) {
			alert('Please upload an image');
        return;
		}
		try {
            let id_ = lastCandidateID + 1;
			const res = await client.add(picture, {
				progress: (prog) => console.log(`received: ${prog}`)
			});
            await contract.methods.addCandidate(
				candidateName,
				position,
				res.path,
			).send({from : address})
            alert('Candidate Added');	
            console.log('Added Candidate')
            sendCandidatesData(id_, candidateName, position, res.path);
            setCandidateName('')
            setPosition('')
            setPicture(null)
            setLastCandidateID(id_)
        } 
        catch (error) {
			alert(error);
		}
        
        
    }

    console.log({candidates, posts});


    return (
        <>
        {/* {contractLive && (<>{votingOccuring && candidates.length !== 0 && <button onClick= {() => setViewCandidates(!viewCandidates)} 
        className = "side-button"> {viewCandidates ? 'Back to Admin' : 'View Candidates'}</button>}</>)} */}
        <div className= "admin-page">
            <div className= 'admin-sidebar'>
                <div className="admin-menu">
                    {views.map((view, idx) => {
                        if (!contractLive && idx !== 4) return;
                        return (
                            <div key= {idx} className= {`admin-menu-item ${currentView === idx && 'item-select'}`} onClick= {() => setCurrentView(idx)}>
                                {view}
                            </div>
                        )
                    })}
                </div>
            </div>
            
            {currentView === 2 &&
            <div className= "admin-page-info">
                <div className= "admin-page">
                    <div className= "admin-page-info">

                        {electionPhase < 2 && <>
                        <h3>Interest Declaration</h3>
                        <div className= "start-and-end-vote">
                            <button className= "start-vote" onClick= {handleStartDeclaration}>
                                Start Interest Declaration
                            </button>
                            <button className= "end-vote" onClick= {handleEndDeclaration}>
                                End Interest Declaration
                            </button>
                        </div></>}

                        <h3>Voting Adjustment</h3>
                        <div className= "start-and-end-vote">
                            <button className= "start-vote" onClick= {handleStartVote}>
                                Start Vote
                            </button>
                            <button className= "end-vote" onClick= {handleEndVote}>
                                End Vote
                            </button>
                        </div>
                        <h3>{' '}</h3>
                        <hr/>
                    </div>
                    

                    <div className= "posts-view">
                        <h3>
                        Create New Post
                        </h3>
                        <div className= "start-and-end-vote">
                            <input type= 'text' placeholder= 'Enter post title' value = {position} onChange= {(e) => setPosition(e.target.value)} />
                            <button onClick = {handleCreatePost}> Create</button>
                        </div>

                        {posts.length > 0 ? <><h3>Posts Available</h3>
                        <ul className= "post-list">
                            {posts_.map((post, idx) => <li key= {idx} className= "post-list-item">{post}</li>)}
                        </ul></> : <h3>No Post Created Yet for Election</h3>}
                    </div>
                    
                </div>
                {!votingOccuring && <button onClick= {handlePublishResults}> Publish Results</button>}
            </div>}

            {currentView === 1 &&
                <div className= "admin-page-info">
                <VotingPage posts= {posts} candidatesByPost= {candidates} isAdminView= {true} accountType = {accountType} isResultView= {electionPhase === 5}/>
                </div>
            }
            
            {currentView === 0 &&
            <div className= "admin-page-info">

                {['Chairman'].includes(accountType) && <>
                <h3> WhiteList Addresses </h3>
                <input type = "file" onChange = {(e) => setFile(e.target.files[0])} />
                <button onClick = {(e) => handleAddStakeholders(e)}>Add Stakeholders</button>
                <hr />

                <h3>Add Candidate</h3>
                <div className= "interest-form">
                            <label htmlFor="candidateName">  Full Name </label>
                            <input type= "text" placeholder= "Enter full name here" value= {candidateName} onChange= {(e)=> setCandidateName(e.target.value)} />

                            <label htmlFor="position"> Position </label>
                            <input type= "text" placeholder= "Enter position here" value= {position} onChange= {(e)=> setPosition(e.target.value)} />

                            <label htmlFor="picture"> Photograph </label>
                            <input type= "file" onChange= {(e)=> setPicture(e.target.files[0])} />

                            {/* <input type="submit" placeholder= "Declare"/> */}
                            <button onClick= {handleAddCandidate}>Submit</button>
                        </div>
                    <hr />

                
                </>}


                <h3>
                    Check Account Type
                </h3>
                <div className= "start-and-end-vote">
                    <input type= 'text' placeholder= 'Enter Address' value = {newAdmin} onChange= {(e) => setNewAdmin(e.target.value)} />
                    <button onClick = {getType}> Check</button>
                </div>
                <div className= "account-type" >{accountType_}</div>
                <hr/>
                
            </div>}
            


            {currentView === 4 &&
            <div className= "admin-page-info">
                {!contractLive && <p>Contract is not enabled at the moment. Please enable contract first or contact Chairman</p>}

                <h3>Contract Availability</h3>
                <div className= "start-and-end-vote">
                    <button className= "start-vote" onClick= {enableContract}>
                        Enable Contract
                    </button>
                    <button className= "end-vote" onClick= {disableContract}>
                        Disable Contract
                    </button>
                </div>
                <hr />

                <h3> Refresh Contract </h3>
                <button onClick = {refreshContract}>Refresh Contract Data</button>
                <hr />
            </div>}
            
            {currentView === 3 &&
            <div className= "admin-page-info">
                <h3>
                    Change Chairman
                </h3>
                <div className= "start-and-end-vote">
                    <input type= 'text' placeholder= 'Enter Address' value = {newChairman} onChange= {(e) => setNewChairman(e.target.value)} />
                    <button onClick = {changeChairman}> Hand Over</button>
                </div>
            </div>}
            

            

            
            
        </div>
        </>
    )
}

export default AdminPage