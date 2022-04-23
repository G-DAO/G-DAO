import { useState } from 'react';


const Landing = ({handleSignIn, notice}) => {

    

    return (
        <div className= "landing-page">
            <h1> Welcome to G-DAO Voting</h1>
            <p> Sign in now to vote for your next parliament Leaders</p>
            <button className= "button-auth" onClick= {handleSignIn}>
                Sign In
            </button>
			{notice && <p style= {{color: 'red'}}> 
			Alert: You need to install MetaMask or any Wallet Authentication extension to use this app
			</p>}
        </div>
        
    )

}

export default Landing;