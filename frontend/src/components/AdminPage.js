import { useState } from 'react';
import * as ipfsClient from 'ipfs-http-client';
import VotingPage from './VotingPage';


const AdminPage = ({contract, startVote, endVote, accountType, address, enableContract, disableContract, contractLive, votingOccuring, candidates, posts, sendCandidatesData}) => {

    const [newAdmin, setNewAdmin] = useState('')
    const [candidateName, setCandidateName] = useState('')
    const [position, setPosition] = useState('')
    const [picture, setPicture] = useState(null)
    const [lastCandidateID, setLastCandidateID] = useState(candidates.length);

    const [viewCandidates, setViewCandidates] = useState(false)
    const [viewResults, setViewResults] = useState(false)
    const [file, setFile] = useState()
    const [accountType_, setAccountType_] = useState('')
    const create = ipfsClient.create;
	const client = create(`https://ipfs.infura.io:5001/api/v0`);
    const fileReader = new FileReader();


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
            let id_ = lastCandidateID;
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

        } 
        catch (error) {
			alert(error);
		}
        
        
    }

    console.log({candidates, posts});


    return (
        <>
        {contractLive && (<>{votingOccuring && candidates.length !== 0 && <button onClick= {() => setViewCandidates(!viewCandidates)} 
        className = "side-button"> {viewCandidates ? 'Back to Admin' : 'View Candidates'}</button>}</>)}
        <div className= "admin-page">
            {!viewCandidates && <>
            {contractLive && <>
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

            <h3>
                Check Account Type
            </h3>
            <div className= "start-and-end-vote">
                <input type= 'text' placeholder= 'Enter Address' value = {newAdmin} onChange= {(e) => setNewAdmin(e.target.value)} />
                <button onClick = {getType}> Check</button>
            </div>
            <div className= "account-type" >{accountType_}</div>
            <hr/>

            {accountType === 'Chairman' && <>
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


            <h3> WhiteList Addresses </h3>
            <input type = "file" onChange = {(e) => setFile(e.target.files[0])} />
            <button onClick = {(e) => handleAddStakeholders(e)}>Add Stakeholders</button>
            <hr />
            </>}
            </>}

            {!contractLive && <p>Contract is not enabled at the moment. Please enable contract first or contact Chairman</p>}


            {accountType === 'Chairman' && <>
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
            </>}
            </>}

            {viewCandidates && <VotingPage posts= {posts} candidatesByPost= {candidates} isAdminView= {true}/>}
            {/* {viewResults && <VotingPage posts= {posts} candidatesByPost= {candidates} isResultView= {true} />} */}

            {!votingOccuring && <button onClick= {handlePublishResults}> Publish Results</button>}
            
        </div>
        </>
    )
}

export default AdminPage