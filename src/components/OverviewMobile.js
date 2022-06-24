import React from 'react'
import { useMoralis } from 'react-moralis';

import Box from "@mui/material/Box";

import rewardPoolContractAbi from "../assets/blockchain/reward_pool_abi.json";
import erc20Abi from "../assets/blockchain/erc20_abi.json";
import { ethers } from 'ethers';

import MobileTable from './MobileTable';
import BlueButton from '../components/BlueButton';

const HEADERS = [
  'Name',
  'No. of Holders',
  'Total Holder Supply',
  'Total Generated',
  'Total Distributed',
  'Total Claimable',
]

const OverviewMobile = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [tablerows, setTablerows] = React.useState([]);
  const { isAuthenticated, account, Moralis } = useMoralis();


  

  // console.log("Signer", await signer.getAddress())

  React.useEffect(() => {
    async function fetchData() {

      // console.log("is Authenticating?", isAuthenticating);
      // console.log("is Authenticated?", isAuthenticated);

      // console.log("account?", account);
      if (isAuthenticated) {
        let rows = [];
        // console.log("is loading?", isLoading)
        const provider = new ethers.providers.Web3Provider(Moralis.provider);
        const signer = provider.getSigner(account);

        // console.log("Signer", await signer.getAddress())
        // console.log("Totality", t)
        const rewardPoolContract = new ethers.Contract(
          "0x0F7eB0cE0803Ac8aA1799777797B3db90ecACcAF",
          rewardPoolContractAbi,
          signer
        );

        let promiseArr = [];

        for (let i = 0; i < 10; i++) {
          promiseArr.push(rewardPoolContract.rewardAssetAt(i))
        }
        const tokenAddresses = await Promise.all(promiseArr);

        promiseArr = [];
        for (let i = 0; i < 10; i++) {
          if (tokenAddresses[i] !== "0x0000000000000000000000000000000000000000") {
            const erc20Contract = new ethers.Contract(
              tokenAddresses[i],
              erc20Abi,
              signer
            );
            promiseArr.push(erc20Contract.name())
          }
        }
        const tokenNames = await Promise.all(promiseArr);

        const totalTokens = tokenNames.length;

        promiseArr = [];

        for (let i = 0; i < totalTokens; i++) {
          promiseArr.push(rewardPoolContract.getNumberOfTokenHolders(tokenAddresses[i]))
        }

        const noOfHolders = (await Promise.all(promiseArr)).map(each => each.toString());
        

        promiseArr = [];

        for (let i = 0; i < totalTokens; i++) {
          promiseArr.push(rewardPoolContract.getTotalRewardsDistributed(tokenAddresses[i]));
        }

        const totalDistributed = (await Promise.all(promiseArr)).map(each => parseFloat(ethers.utils.formatEther(each.toString())).toFixed(2));

        promiseArr = [];
        for (let i = 0; i < totalTokens; i++) {
          promiseArr.push(rewardPoolContract.rewardInfo(tokenAddresses[i]))
        }

        let totalGenerated = (await Promise.all(promiseArr)).map(({totalRewardsDistributed}) => parseFloat(ethers.utils.formatEther(totalRewardsDistributed.toString())).toFixed(2));

        promiseArr = [];
        for (let i = 0; i < totalTokens; i++) {
          promiseArr.push(rewardPoolContract.totalHolderSupply(tokenAddresses[i]))
        }

        const totalHolderSupply = (await Promise.all(promiseArr)).map(each => ethers.utils.formatEther(each.toString()));

        for (let i = 0; i < totalTokens; i++) {
          rows.push([
            tokenNames[i],
            noOfHolders[i],
            totalHolderSupply[i],
            totalGenerated[i],
            totalDistributed[i],
            totalGenerated[i] - totalDistributed[i]
          ]);
        }
        
        setTablerows(rows)
        setIsLoading(false)

      }

    }

    fetchData()

  }, [isAuthenticated, Moralis.provider, account]);

  const handleUpdateBalance = async () => {
    if(isAuthenticated){

      const provider = new ethers.providers.Web3Provider(Moralis.provider);
      const signer = provider.getSigner(account);
      const rewardPoolContract = new ethers.Contract(
        "0x0F7eB0cE0803Ac8aA1799777797B3db90ecACcAF",
        rewardPoolContractAbi,
        signer
      );
      await rewardPoolContract.updateBalance();
    }
  };

  return (
    <>
    <MobileTable headers={HEADERS} rows={tablerows} isLoading={isLoading}/>
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 3 }}>
      <BlueButton onClick={handleUpdateBalance}>Update Balance</BlueButton>
    </Box>
    </>
  )
}

export default OverviewMobile