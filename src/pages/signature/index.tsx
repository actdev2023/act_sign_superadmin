import React, { useState, ChangeEvent, FormEvent, useEffect, useContext } from 'react';
import { fetchSignature } from 'src/lib/api';
import Image from 'next/image';
import { config } from "../../configs/config";

const { API_URL } = config;


// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

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
    <div>
        <form onSubmit={handleSubmit}>
            <input type='file' onChange={handleFileChange} />
            <button type='submit'>Upload</button>
        </form>

        {signature && <SignatureImage signature={signature} />}

    </div>
  )
}


export default SignaturePage
