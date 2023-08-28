import React, { useState, ChangeEvent, FormEvent, useEffect, useContext } from 'react';
import { fetchSignature } from 'src/lib/api';
import Image from 'next/image';
import { config } from "../../configs/config";
import withAuth from 'src/context/withAuth';
import TableSignaureServerSide from 'src/views/table/TableSignatureServerSide';

const { API_URL } = config;


// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import  Box from '@mui/material/Box';
import PageHeader from 'src/@core/components/page-header';
import { Button, InputAdornment, InputLabel, OutlinedInput, TextField } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { styled, useTheme } from '@mui/material/styles';
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';

const SignatureImage = ({ signature }: {signature: string }) => {
    return (
        <div>
            <h2>Your Signature</h2>
            <Image src={`${API_URL}/uploads/${signature}`} alt="Signature" width={400} height={200} />
        </div>
    )
}



const SignaturePage = () => {
 
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [signature, setSignature] = useState('');
    const handleViewClick = (fileId: string) => {
       
     }
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const signature = await fetchSignature('1');
                setSignature(signature);
            } catch (error) {
                console.error('Error fetching signature', error);
            }
        };

        fetchData();
    }, []);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if(event.target.files && event.target.files.length > 0){
            setSelectedFile(event.target.files[0]);
        }
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if(selectedFile) {
            const formData = new FormData();
            formData.append('image', selectedFile);

            try{
                const response = await fetch(`${API_URL}/upload`, {
                    method: 'POST',
                    body: formData,                
                });

                if (response.ok){
                    console.log('Image uploaded successfully');
                } else {
                    console.log('Error uploading image');
                }
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        }
    }
  return (
    <Grid container spacing={6}>
            <PageHeader
                title={
                    <Typography variant='h5'>
                        Signatures
                    </Typography>
                }
                subtitle={
                    <Typography variant='body2'>
                        User Signatures
                    </Typography>
                }
            />
            
            <Grid item xs={12}>
                <TableSignaureServerSide onView={handleViewClick} />
            </Grid>          
        </Grid>
  )
}


export default withAuth(SignaturePage);
