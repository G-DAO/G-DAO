import { useState } from 'react';

const NavBar = ({address, accountType, toggleHome, disconnectAccount, isLandingPage}) => {

    const [showingHome, setShowingHome] = useState(true);

    const setHomeToggle = (homeOrAdmin) => {
        homeOrAdmin === 'home' && setShowingHome(true);
        homeOrAdmin === 'admin' && setShowingHome(false);
        toggleHome(homeOrAdmin);
    }


    return (
        <nav className ={isLandingPage ? "nav-bar-landing" : "nav-bar"}>
            <div className = "nav-bar-main">
                <h1><a href= "https://docs.google.com/document/d/1RR7kwWIXY25usD3EvNXTioLv51Ja1C3CGtTvnodlFZk/edit?usp=sharing" target="blank" className="nab"> G-DAO </a></h1> 
                {!isLandingPage && <div className= "nav-buttons">
                    <button className = {showingHome ? 'nav-select' : 'nav-unselect'} onClick = {() => setHomeToggle('home')}>
                        Home
                    </button>
                    {accountType !== 'Student' && <button className = {!showingHome ? 'nav-select' : 'nav-unselect'} onClick = {() => setHomeToggle('admin')}>
                        Admin
                    </button>}

                    <p>{`${address.substring(0,7)}...`}</p>
                    <button className= "sign-out" onClick= {disconnectAccount}>
                        Sign Out
                    </button>
                </div>}
            </div>
        </nav>
    )
}

NavBar.defaultProps = {
    address: '',
    accountType: '',
    toggleHome: () => {},
    disconnectAccount: () => {}
}

export default NavBar