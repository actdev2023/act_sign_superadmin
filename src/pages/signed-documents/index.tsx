// ** React import
import React, {useRef, ChangeEvent, useState, useEffect, useCallback, useContext} from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {PDFDocument, PDFImage, degrees} from 'pdf-lib';
import {Document, Page, pdfjs} from 'react-pdf';
import { fetchSignature } from 'src/lib/api';
import { config } from "../../configs/config";
import TablePdfSignedServerSide from 'src/views/table/TablePdfSignedServerSide';
import { AbilityContext } from 'src/layouts/components/acl/Can';
import withAuth from 'src/context/withAuth';

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




function PDFDocumentSignedPage() {
    const ability = useContext(AbilityContext)
    const router = useRouter();

   

     const handleViewClick = (fileId: string) => {
        router.push(`pdf-documents/view/${fileId}`);
     }
   

     
    return (
        <Grid container spacing={6}>
            <PageHeader
                title={
                    <Typography variant='h5'>
                        PDF Documents
                    </Typography>
                }
                subtitle={
                    <Typography variant='body2'>
                        Signed Documents
                    </Typography>
                }
            />

            
            <Grid item xs={12}>
                <TablePdfSignedServerSide onView={handleViewClick} />
            </Grid>          
        </Grid>
    )
}

export default withAuth(PDFDocumentSignedPage);
