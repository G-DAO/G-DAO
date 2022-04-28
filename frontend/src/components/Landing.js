import { useState } from 'react';
import voteSign from '../voters.png'
import NavBar from './NavBar';


const Landing = ({handleSignIn, notice}) => {

    

    return (
		<>
		<NavBar isLandingPage= {true}/>
        <div className= "landing-page">
			
			<div className= "landing-page-detail">
				<h1> Welcome to G-DAO Voting</h1>
				<p> Sign in now to vote for your next parliament Leaders</p>
				<button className= "button-auth" onClick= {handleSignIn}>
					Sign In
				</button>
				{notice && <p style= {{color: 'red'}}> 
				Alert: You need to install MetaMask or any Wallet Authentication extension to use this app
				</p>}
			</div>

			<div>
				<img src = "https://voting-dapp-frontend.vercel.app/_next/image?url=%2Fimages%2F1.png&w=1200&q=75" alt= "Voters" height= {500} width= {500} />
			</div>
            
        </div>
        </>
    )

}

export default Landing;