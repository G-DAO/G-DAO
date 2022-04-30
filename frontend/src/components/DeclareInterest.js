import { FaSpinner, FaAngleDoubleDown, FaAngleDoubleUp } from 'react-icons/fa';
import { useState } from 'react';
import * as ipfsClient from 'ipfs-http-client';


const DeclareInterest = ({posts, hasDeclared, contract, address}) => {
    const [currentSelection, setCurrentSelection] = useState('')
    const [candidateName, setCandidateName] = useState('')
    const [picture, setPicture] = useState(null)
    const create = ipfsClient.create;
	const client = create(`https://ipfs.infura.io:5001/api/v0`);


    const handleDeclareInterest = async () => {
        console.log(currentSelection)
        console.log(posts.indexOf(currentSelection))

        if(hasDeclared) {
            alert('You already declared interest, and you can only do it once.');
        }

        if (picture === null) {
			alert('Please upload an image');
        return;
		}
		try {
			const res = await client.add(picture, {
				progress: (prog) => console.log(`received: ${prog}`)
			});
            await contract.methods.declareInterest(
				candidateName,
				posts.indexOf(currentSelection),
				res.path,
			).send({from : address})
            alert('Interest Declared');
            setCandidateName('')
            setPicture(null)
            setCurrentSelection('')
        } 
        catch (error) {
			alert(error);
		}
        
    }

    return (
        <div className= "voting-page">

            {!hasDeclared ? <>
            <h3>
                Declaration of Interests
            </h3>
            <p> Select post to declare interest from the list below and fill in the required details</p>

            {currentSelection === '' ? posts.map((post, index) => {
                
                return (
                    <div key= {index} className = "voting-bar">
                        <div className= "voting-bar-header">
                            <h2>{post}</h2>
                            < FaAngleDoubleDown onClick= {() => setCurrentSelection(post)} />
                        </div>
                    </div>
                )
            }) : <div className = "voting-bar">
                    <div className= "voting-bar-header">
                        <h2>{currentSelection}</h2>
                        <FaAngleDoubleUp onClick= {() => setCurrentSelection('')} />
                    </div>

                    <div className= "interest-form">
                            <label htmlFor="candidateName">  Full Name </label>
                            <input type= "text" placeholder= "Enter full name here" value= {candidateName} onChange= {(e)=> setCandidateName(e.target.value)} />

                            <label htmlFor="picture"> Photograph </label>
                            <input type= "file" onChange= {(e)=> setPicture(e.target.files[0])} />

                            {/* <input type="submit" placeholder= "Declare"/> */}
                            <button onClick= {handleDeclareInterest}>Submit</button>
                        </div>
                </div>} </> : 
                <>
                <h3>
                    Declaration of Interests
                </h3>
                <p> You have previously declared interest for a post and you can not declare again </p>
                </>}
        </div>
    )
}


export default DeclareInterest