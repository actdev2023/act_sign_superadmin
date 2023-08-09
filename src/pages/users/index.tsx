// ** React import
import React, {useRef, ChangeEvent, useState, useEffect, useCallback, useContext} from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {PDFDocument, PDFImage, degrees} from 'pdf-lib';
import {Document, Page, pdfjs} from 'react-pdf';
import { fetchSignature } from 'src/lib/api';
import { config } from "../../configs/config";
import TableUserServerSide from 'src/views/table/TableUserServerSide';

const { API_URL } = config;

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import  Box from '@mui/material/Box';
import PageHeader from 'src/@core/components/page-header';
import { Button } from '@mui/material';
import  Icon from 'src/@core/components/icon';




function UsersPage() {
   
    const router = useRouter();

  
     const handleViewClick = (fileId: string) => {
        router.push(`pdf-documents/view/${fileId}`);
     }
   

     
    return (
        <Grid container spacing={6}>
            <PageHeader
                title={
                    <Typography variant='h5'>
                        Users
                    </Typography>
                }
                subtitle={
                    <Typography variant='body2'>
                        Add Users
                    </Typography>
                }
            />
            <Grid item xs={6}>
                <Link href="/users/add-user">
                    <Button variant='contained' endIcon={<Icon icon='tabler:user-plus' />}>
                    Add Users
                    </Button>
                </Link>
            </Grid>
            <Grid item xs={12}>
                <TableUserServerSide onView={handleViewClick} />
            </Grid>          
        </Grid>
    )
}


export default UsersPage
