import React, { useState } from 'react'
import { Typography, Box, Paper, Tabs, Tab, Grid, TextField } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';

import InnerBox from "./InnerBox";
import BlueButton from './BlueButton';
import { useMoralis } from 'react-moralis';
import { ethers } from 'ethers';
import buyTokenABI from "../assets/blockchain/buy_token_abi.json";

const Generate = () => {
  const theme = useTheme();
  const { isAuthenticated, isWeb3Enabled, user, Moralis} = useMoralis();
  const [minDeposit, setMinDeposit] = React.useState(0);
  const [maxDeposit, setMaxDeposit] = React.useState(0);
  const [discount, setDiscount] = React.useState(0);
  const [value, setValue] = useState(0);

  React.useEffect(() => {
    async function fetchData(){
      if(isAuthenticated) {
        if(!isWeb3Enabled) await Moralis.enableWeb3();
        const provider = new ethers.providers.Web3Provider(Moralis.provider);
        const buyTokenContract = new ethers.Contract(
          "0x936c31F6316262632A677815aCe93FDf2f8143b3",
          buyTokenABI,
          provider
        );
        const mind = ethers.utils.formatEther((await buyTokenContract.minimumDeposit()).toString());
        const maxd = ethers.utils.formatEther((await buyTokenContract.maximumDeposit()).toString());
        const currD = parseFloat((await buyTokenContract.currentDiscount()).toString());

        console.log("Data", mind, maxd, currD);
        setMinDeposit(mind);
        setMaxDeposit(maxd);
        setDiscount(currD);

      }
    };
    fetchData()
  }, [isAuthenticated, isWeb3Enabled])
  return (
    <InnerBox paperSx={{p: {xs: 2, lg: 3}}}>
      <Paper sx={{ width: "100%", borderRadius: theme.spacing(2), p: 2}}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <Typography variant="subtitle2">Enter BNB Amount</Typography>
          <Typography variant="subtitle2">To Receive</Typography>
        </Box>
        <Grid
          container
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid item xs={5} align="center">
          <TextField fullWidth variant='outlined' onChange={(e) => setValue(e.target.value)}/>
          </Grid>
          <Grid item xs={2} align="center">
            <ArrowRightAltIcon/>
          </Grid>
          <Grid item xs={5} align="center">
            <TextField fullWidth variant='outlined' disabled value={value}/>
          </Grid>
        </Grid>
      </Paper>
      <Typography align="left" variant="subtitle2" mt={4}>
        Min Tokens to Buy: {minDeposit}
      </Typography>
      <Typography align="left" variant="subtitle2">
        Max Tokens to buy: {maxDeposit}
      </Typography>
      <Typography align="left" variant="subtitle2">
        Discount: {discount === 0 ? 'N/A' : `${discount} %`}
      </Typography>
      <Box sx={{ mt: 1}}>
        <Typography variant='caption' align="left" >
          *Any Locked Tokens can be found under Reserved Tab
        </Typography>
      </Box>
      <BlueButton fullWidth sx={{mt: 2}}>Buy Now</BlueButton>

    </InnerBox>
  )
}

export default Generate