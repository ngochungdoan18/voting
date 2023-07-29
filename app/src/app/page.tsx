'use client'

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import VotingContract from "../contracts/Voting.json"; // Replace with the path to your compiled contract JSON

export default function Home() {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [contract, setContract] = useState<ethers.Contract>();
  const [options, setOptions] = useState<{ name: string; voteCount: number }[]>(
    []
  );
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const [hasVoted, setHasVoted] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contractAddress = "0xf8a0C28a47f9Eb32a96328710a76feE0dD4327c9"; // Replace with the deployed contract address
        const ct = new ethers.Contract(
          contractAddress,
          VotingContract.abi,
          signer
        );
        console.log(ct)
        setProvider(provider);
        setContract(ct);
        await fetchOptions(ct);
        const hasVoted = await ct.hasVoted(await signer.getAddress())
        setHasVoted(hasVoted);
      } else {
        alert("Please install MetaMask to use this app.");
      }
    };
    init();
  }, []);
  
  const fetchOptions = async (contract: any) => {
    const optionCount = await contract.getOptionCount();
    const options = [];
    for (let i = 0; i < optionCount; i++) {
      const [name, voteCount] = await contract.getOption(i);
      options.push({ name, voteCount: voteCount.toNumber() });
    }
    setOptions(options);
  };

  const handleVote = async (contract: any) => {
    try {
      await contract.vote(selectedOption);
      setHasVoted(true);
      await fetchOptions(contract); // Refresh the options after voting
    } catch (error: any) {
      console.error("Error voting:", error.message);
      if (error.message.includes("already voted")) {
        setHasVoted(true);
      }
    }
  };

  const renderOptions = () => {
    return options.map((option, index) => (
      <div key={index}>
        <label>
          <input
            type="radio"
            value={index}
            checked={selectedOption === index}
            onChange={() => setSelectedOption(index)}
            disabled={hasVoted}
          />
          {option.name} ({option.voteCount} votes)
        </label>
      </div>
    ));
  };

  return (
    <div>
      <h1>Simple Voting App</h1>
      {!provider ? (
        <button onClick={() => window.ethereum.enable()}>
          Connect Wallet (MetaMask)
        </button>
      ) : (
        <div>
          <h2>Options:</h2>
          {renderOptions()}
          {hasVoted ? (
            <p>You have already voted. Thank you for voting!</p>
          ) : (
            <button onClick={() => handleVote(contract)}>Vote</button>
          )}
        </div>
      )}
    </div>
  );
}
