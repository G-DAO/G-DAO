import './App.css';
import Landing from './components/Landing';
import VotingPage from './components/VotingPage';
import NavBar from './components/NavBar';
import AdminPage from './components/AdminPage';
import { useState, useEffect } from 'react';
import Web3 from 'web3/dist/web3.min.js';
import { CONTRACT_ABI } from './constants';
import { contactAddress } from './contractAddress';
import Footer from './components/Footer';
import DeclareInterest from './components/DeclareInterest';



function App() {
  const [electionPhase, setElectionPhase] = useState(2);
  const [currentPage, setCurrentPage] = useState('login');
  const [accountType, setAccountType] = useState('Chairman');
  const [contractAvailability, setContractAvailability] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [contract, setContract] = useState({});
  const [loginNotice, setLoginNotice] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('')
  const [candidates, setCandidates] = useState([])
  const [posts, setPosts] = useState([])
  const [userHasDeclared, setUserHasDeclared] = useState(false)
  const [userHasVoted, setUserHasVoted] = useState(false)

  


  const startVote = () => {
     contract.methods.beginVote().send({
       from:selectedAccount
     }).then(() => { alert('Started voting session')
     setElectionPhase(1) 
    }).catch((err) => {console.log(err) })
  }

  const endVote = () => {
    contract.methods.endVote().send({
      from:selectedAccount
    }).then(() => { alert('Ended voting session')
    setElectionPhase(2) 
   }).catch((err) => {console.log(err) })
 }

  const disableContract = () => {
    contract.methods.disable().send({
      from:selectedAccount
    }).then(() => { alert('Contract Disabled')
    setContractAvailability(false) 
   }).catch((err) => {console.log(err) })
  }

  const enableContract = () => {
    contract.methods.enable().send({
      from:selectedAccount
    }).then(() => { alert('Contract Enabled')
    setContractAvailability(true) 
   }).catch((err) => {console.log(err) })
  }

  const getElectionPhase = async (contract) => {
    let p = await contract.methods.getElectionPhase().call()
    console.log(p)
    setElectionPhase(Number(p));
    
  }

  const handleContractAvailability = async (contract) => {
    let p = await contract.methods.contractstate().call()
    return p;
  }

  const getAccountType = async (contract_, address) => {
    console.log(contract_)
    let p = await contract_.methods.login(address).call()
    return p;
  }

  const getPosts = async (contract_) => {
    let p = await contract_.methods.getAvailablePosts().call();
    console.log(p)
    return p;
  }

  const checkIfVoted = async (contract_, address) => {
    let p = await contract_.methods.hasVoted(address).call();
    return p;
  }

  const checkIfDeclared = async (contract_, address) => {
    let p = await contract_.methods.hasDeclared(address).call();
    return p;
  }

  const handleGetCandidates = async (contract) => {

    let k = await contract.getPastEvents('candidates', {fromBlock: 0})
    let result_ = []
    let res = []
    k.map((ele, id) => {
      let p = {}
      p.ID = ele.returnValues.ID
      p.name = ele.returnValues.name
      p.CID = ele.returnValues.ipfs
      p.position = ele.returnValues.position
      p.votesCount = 0

      result_.push(p)
      
    })

    setCandidates(result_)
    console.log(result_)

  }

  const handleGetApprovedCandidates = async (contract) => {

    let k = await contract.getPastEvents('Approved', {fromBlock: 0})
    let result_ = []
    let res = []
    k.map((ele, id) => {
      let p = {}
      p.ID = ele.returnValues.ID
      p.name = ele.returnValues.name
      p.CID = ele.returnValues.ipfs
      p.position = ele.returnValues.position
      p.votesCount = 0
      result_.push(p)
      
    })

    setCandidates(result_)
    console.log(result_)

  }

  const handleGetResults = async (contract) => {
    // let p = await contract.methods.getCandidates().call()
    // return p;

    let k = await contract.getPastEvents('result', {fromBlock: 0})
    let result_ = []
    k.map((ele, id) => {
      let p = {}
      p.ID = ele.returnValues.Candid.ID
      p.name = ele.returnValues.Candid.name
      p.CID = ele.returnValues.Candid.ipfs
      p.position = ele.returnValues.Candid.position
      p.votesCount = Number(ele.returnValues.votes)

      result_.push(p)
      
    })

    setCandidates(result_)
    console.log(result_)

  }

  const updateCandidates = (id, name_, post, ipfs) => {
    const data = {
      ID: id,
      name: name_,
      CID: ipfs,
      position: post
    }

    setCandidates([...candidates, data])
  }

  const handleSignIn = async (contract_) => {
    let provider = window.ethereum;
    console.log(contract_);
    setLoaded(true)
  
    if (typeof provider !== 'undefined') {
      provider
        .request({ method: 'eth_requestAccounts' })
        .then((accounts) => {
          setSelectedAccount(accounts[0]);
          console.log(`Selected account is ${selectedAccount}`);
          setCurrentPage('home')

          getAccountType(contract_, accounts[0]).then(p => {
            if (!['Student', 'Chairman', 'Teacher', 'Director'].includes(p)) {
              alert('You have signed in with an unauthorized account. Contact the Chairman or any of the teachers')
              setCurrentPage('login')
              setLoaded(false)
              return
            }
            setAccountType(p)
            setCurrentPage('home')
            setLoaded(false)
          })
          checkIfDeclared(contract_, accounts[0]).then(p => setUserHasDeclared(p));

          checkIfVoted(contract_, accounts[0]).then(p => setUserHasVoted(p));

        })
        .catch((err) => {
          console.log(err);
          setCurrentPage('login')
          setLoaded(false)
          return;
        });
  
      window.ethereum.on('accountsChanged', function (accounts) {
        setLoaded(true)
        setSelectedAccount(accounts[0]);
        getAccountType(contract_, accounts[0]).then(p => {
          if (!['Student', 'Chairman', 'Teacher', 'Director'].includes(p)) {
            alert('You tried signing in with an unauthorized account. Contact the Chairman or any of the teachers')
            setCurrentPage('login')
            return
          }
          setAccountType(p)
          setCurrentPage('home')

          checkIfDeclared(contract_, accounts[0]).then(p => setUserHasDeclared(p));

          checkIfVoted(contract_, accounts[0]).then(p => setUserHasVoted(p));
        })
        console.log(`Selected account changed to ${selectedAccount}`)
        setTimeout(() => setLoaded(false), 1000)
      });
    }
  };

  useEffect(() => {
    let provider = window.ethereum;

    if (typeof provider === 'undefined') {
      setCurrentPage('login')
      setLoginNotice(true);
      return;
    }

    const web3 = new Web3(provider);
    let contract_ = new web3.eth.Contract(
    	CONTRACT_ABI,
    	contactAddress
    );
    console.log(contract_)
    setContract(contract_);

    handleSignIn(contract_).then((tx) => console.log(tx))

    handleContractAvailability(contract_).then(p => {
      console.log(p)
      setContractAvailability(p)});
    
    getPosts(contract_).then(p => setPosts(p));
    
    if (electionPhase < 3) {
      handleGetCandidates(contract_)
    } else if (electionPhase < 5) {
      handleGetApprovedCandidates(contract_)
    }

    getElectionPhase(contract_)

  }, [])

  useEffect(() => {

    if (electionPhase === 5) {
      handleGetResults(contract)
    }

    

  }, [electionPhase, contract])

  // const posts = ['President', 'Vice President'];

  // const candidatesByPost = [{name: 'John Mike', watchword: 'I came to save', CID: 'QmaXjpTENetYrqHicuyNweCgVdLHuEqLQ3PrwQ4MAMc1SS',
  //   post: 'President' },
  //   {
  //     name: "Ebube Ebube",
  //     CID: "QmaXjpTENetYrqHicuyNweCgVdLHuEqLQ3PrwQ4MAMc1SS",
  //     watchword: "I believe I will make G-DAO great.",
  //     post: 'President'
  //   },
  //   {
  //     name: "Ebube Junior",
  //     CID: "QmaXjpTENetYrqHicuyNweCgVdLHuEqLQ3PrwQ4MAMc1SS",
  //     watchword: "I believe I will make G-DAO great.",
  //     post: 'Vice President'
  //   }, {
  //     name: "Ebube Jack",
  //     CID: "QmaXjpTENetYrqHicuyNweCgVdLHuEqLQ3PrwQ4MAMc1SS",
  //     watchword: "I believe I will make G-DAO great.",
  //     post: 'Vice President'
  //   }];

  const loadPage = (<div>
    <p>Loading .....</p>
  </div>)

  const fallback = (<div>
    <h1>404</h1>
    <p>The resource you seek is currently not available. Check back another time.</p>
  </div>)

  console.log(electionPhase)

  return (
    <div className="App">
      {!loaded ? (currentPage === 'login' ? <Landing handleSignIn= {() => handleSignIn(contract)} notice = {loginNotice} /> :
      <>
      <NavBar address = {selectedAccount} accountType = {accountType} toggleHome = {(homeOrAdmin) => setCurrentPage(homeOrAdmin)} disconnectAccount= {()=> setCurrentPage('login')} />
      <div className= "layout">
        { contractAvailability ? <>
          <h3>Welcome, {accountType}</h3>
        <hr/>
        {currentPage === 'home' && (electionPhase === 3 ? <VotingPage posts = {posts} candidatesByPost = {candidates} contract = {contract} address= {selectedAccount} electionPhase= {electionPhase} /> :
        electionPhase === 1 ? (accountType === 'Student' ? <DeclareInterest posts = {posts} hasDeclared = {userHasDeclared} contract= {contract} address= {selectedAccount} /> : <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
        <p> Declaration of Interests is ongoing at the moment</p>
        <p> {'   '}</p>
        <p> After declaration ends, voting can start on this page.</p>
        </div>) :
        electionPhase === 2 ? <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
        <p> {accountType === 'Chairman' ? 'You have ended Interest Declaration' : 'Declaration of Interests has ended at the moment'}</p>
        <p> {'   '}</p>
        <p> {accountType === 'Chairman' ? 'Start Vote from Admin Page next' : 'Voting will be commenced next. If you think this is wrong, contact the Chairman.'}</p>
        </div> :
        (electionPhase === 5 ? <VotingPage posts = {posts} candidatesByPost = {candidates} contract = {contract} resultsCompiled = {true} electionPhase= {electionPhase}/> : 
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
          {electionPhase === 4 ? <p> Voting session has been concluded</p> : <p> {accountType === 'Chairman' ? 'You have not commenced a new election cycle' : 'Election cycle has not commenced'}</p>}
          <p> {'   '}</p>
          {electionPhase === 4 ? <p> Come back later to view results after they have been published</p> : <p> {accountType === 'Chairman' ? 'Create Posts and Commence cycle by starting Interest Declaration' : 'You will be notified when it commences'}</p>}
          </div>))}
          </> : (currentPage !== 'admin' && fallback)}

        {currentPage === 'admin' && <AdminPage startVote = {startVote} endVote = {endVote} accountType = {accountType} address = {selectedAccount}
        contract= {contract} enableContract= {enableContract} disableContract= {disableContract} contractLive = {contractAvailability} electionPhase_= {electionPhase}
        candidates= {candidates} posts = {posts} sendCandidatesData= {updateCandidates} setPage = {(page) => setCurrentPage(page)}/>}
      </div>
      < Footer />
      </>) : loadPage}
      
    </div>
  );
}

export default App;
