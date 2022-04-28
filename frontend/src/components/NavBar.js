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
                <h1>G-DAO</h1>
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