// ** React import
import React, {useRef, ChangeEvent, useState, useEffect, useCallback, Fragment, useContext} from 'react';
import {PDFDocument, PDFImage, degrees} from 'pdf-lib';
import {Document, Page, pdfjs } from 'react-pdf';
import { fetchSignature } from 'src/lib/api';

import { config } from "../../../configs/config";
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { AbilityContext } from 'src/layouts/components/acl/Can';



const { API_URL } = config;
const SERVER_URL = 'http://localhost:8080/uploads/documents/';

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import  Box from '@mui/material/Box';
import PageHeader from 'src/@core/components/page-header';
import { Button, TextField } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { styled, useTheme } from '@mui/material/styles';

// ** Icon Imports
import Icon from 'src/@core/components/icon';


pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;



const Img = styled('img')(({ theme }) => ({
    width: 48,
    height: 48,
    marginBottom: theme.spacing(8.5)
}));



const fetchFileFromAPI = async (fileId: string): Promise<{ fileUrl: string; stampPosition: { x: number; y: number; width: number; height: number; }; dateTextPosition: { date_x: number; date_y: number; date_size: number; }; dateText: string; pageAllNumber:  boolean; page_start: number; page_end: number;  }> => {
    try {

        const response = await fetch(`${API_URL}/api/files/${fileId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch file details');
        }

        const fileData = await response.json();


       
        const stampPosition = {
            x: parseInt(fileData.x, 10),
            y:  parseInt(fileData.y, 10),
            width:  parseInt(fileData.width, 10),
            height:  parseInt(fileData.height, 10)
        };

        const dateTextPosition = {
            date_x: parseInt(fileData.date_x, 10),
            date_y:  parseInt(fileData.date_y, 10),
            date_size:  parseInt(fileData.date_size, 10)
        };

        
            
            
            
        

        return { fileUrl: fileData.filename, stampPosition, dateTextPosition, dateText: fileData.date_text, pageAllNumber: fileData.page_number, page_start: parseInt(fileData.page_start, 10), page_end: parseInt(fileData.page_end, 10)};


    } catch (error) {
        throw new Error(`Error fetching file details:`);
    }
};

function PDFDocumentView() {
    const ability = useContext(AbilityContext)
    const router = useRouter();
    const { fileId } = router.query;
    const [numPages, setNumPages] = useState(0);
    const [fileUrl, setFileUrl] = useState<string>('');
    const [signature, setSignature] = useState('');
    const [stampPosition, setStampPosition] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
    const [dateTextPosition, setDateTextPosition] = useState<{ date_x: number, date_y: number, date_size: number } | null>(null);
    const [dateText, setDateText] = useState<string>('');
    const [pageStart, setPageStart] = useState(0);
    const [pageEnd, setPageEnd] = useState(0);
    const [pageAllNumber, setPageAllNumber] = useState(false);
    

    const theme = useTheme();

    
    
    
    
    

    useEffect(() => {
        

        fetchFileDetails();
        const fetchData = async () => {
            try {
                const signature = await fetchSignature('1');
                setSignature(signature);
            } catch (error) {
                console.error('Error fetching signature', error);
            }
        };

        fetchData();

        return () => {
            pdfjs.GlobalWorkerOptions.workerSrc = ``;
        };
    }, [fileId]);

        const fetchFileDetails = async () => {
            try {
                const fileData = await fetchFileFromAPI(fileId as string);
                setFileUrl(`http://localhost:8080/uploads/documents/${fileData.fileUrl}`);
                setStampPosition(fileData.stampPosition);
                setDateTextPosition(fileData.dateTextPosition);
                setDateText(fileData.dateText)
                setPageAllNumber(fileData.pageAllNumber);
                setPageStart(fileData.page_start);
                setPageEnd(fileData.page_end);
            } catch (error) {
                console.error('Error fetching file details', error);
            }
        };

        const renderStampPreview = (pageNumber: number) => {
            console.info('pageallnumber:' , pageAllNumber);
           
               
                if(pageAllNumber || pageNumber >= pageStart && pageNumber <= pageEnd){
                    
                    return (
                        <div
                            className="stamp-preview"
                            style={{ left: stampPosition?.x, top: stampPosition?.y, width: stampPosition?.width, height: stampPosition?.height, position: 'absolute', border: '2px dashed red' }}
                        >
                            Your Signature
                        </div>
                    );
                }
           
            return null;
           
        }

        const renderDatePreview = (pageNumber: number) => {
            console.info('pageallnumber:' , pageAllNumber);
           
               
                if(pageAllNumber || pageNumber >= pageStart && pageNumber <= pageEnd){
                    
                    return (
                        <div
                    className="stamp-preview"
                    style={{ left: dateTextPosition?.date_x, top: dateTextPosition?.date_y, fontSize: dateTextPosition?.date_size+'px', position: 'absolute', border: '2px dashed red' }}
                >
                    {dateText}
                </div>
                    );
                }
           
            return null;
           
        }

    if(!fileUrl) {
        return <div>Loading...</div>;
    }

    const handleApplyStamp = async () => {
        try {
            const pdfBytes = await fetch(fileUrl).then((response) => response.arrayBuffer());
            const pdfData = new Uint8Array(pdfBytes);
            if (!pdfData) return;
            const pdfDoc = await PDFDocument.load(pdfData);
            const signatureUrl = `${API_URL}/uploads/${signature}`;
            const response = await fetch(signatureUrl);
            if(!response.ok){
                throw new Error('Failed to fetch signature image');
                
            }
            console.log(response);

            //Load the stamp image 
            const stampImageBytes = await response.arrayBuffer();
            const stampImage2 = await pdfDoc.embedPng(stampImageBytes);

            const pages = pdfDoc.getPages();
            if(pageAllNumber) {
                for (let i=0; i < pages.length; i++) {
                    const page = pages[i];
    
                    const stamDims = stampImage2.scale(0.25);
                    const { width, height } = page.getSize();
                    if(stampPosition){
                        const { x, y, width: stampWidth, height: stampHeight } = stampPosition;
                    page.drawImage(stampImage2, {
                        x: x ?? 0,
                        y:height - (y ?? 0) - (stampHeight ?? 0),
                        width: stampWidth ?? 0,
                        height: stampHeight ?? 0,
                        rotate: degrees(0),
                        opacity: 0.8,
    
                    });
                    }
                    if(dateTextPosition){
                        const { date_x, date_y, date_size: dateSize} = dateTextPosition;
                    page.drawText(dateText, {
                        x: date_x ?? 0,
                        y: height- (date_y ?? 0),
                        size: dateSize ?? 0,
                        rotate: degrees(0),
                        opacity: 1,
    
                    });
                    }
                }

            }
            else {
                for (let i=pageStart - 1; i < pageEnd; i++) {
                    const page = pages[i];

                    const stamDims = stampImage2.scale(0.25);
                    const { width, height } = page.getSize();
                    if(stampPosition){
                        const { x, y, width: stampWidth, height: stampHeight } = stampPosition;
                    page.drawImage(stampImage2, {
                        x: x ?? 0,
                        y:height - (y ?? 0) - (stampHeight ?? 0),
                        width: stampWidth ?? 0,
                        height: stampHeight ?? 0,
                        rotate: degrees(0),
                        opacity: 0.8,

                    });
                    }
                    if(dateTextPosition){
                        const { date_x, date_y, date_size: dateSize} = dateTextPosition;
                    page.drawText(dateText, {
                        x: date_x ?? 0,
                        y: height- (date_y ?? 0),
                        size: dateSize ?? 0,
                        rotate: degrees(0),
                        opacity: 1,
    
                    });
                    }
                }
            }

            //save the modified pdf as a new file
            const modifiedPdfData = await pdfDoc.save();

            const formData = new FormData();
            formData.append('signedPdf', new Blob([modifiedPdfData], { type: 'application/pdf' }), 'signed.pdf');
            formData.append('fileId', fileId as string);

            const response2 = await fetch(`${API_URL}/api/upload-signed-pdf`, {
                method: 'POST',
                body: formData,
            });

            if (response2.ok) {

                
                toast.success('Signed PDF uploaded successfully');
                router.push('/signed-documents/');

                //Generate URL for the modified PDF
                //const modifiedPdfUrl = URL.createObjectURL(new Blob([modifiedPdfData], { type: 'application/pdf' }));

                //Open new window
                //window.open(modifiedPdfUrl);
            } else {
                console.error('Error uploading signed PDF:', response2.status);
            }
        } catch (error) {
            console.error('Error applying signature and uploading PDF:', error)
        }
    };


    const handleDocumentLoadSuccess = ({ numPages}: { numPages: number}) => {
        setNumPages(numPages);
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
                        Upload Documents
                    </Typography>
                }
            />
            
            
            <Grid item xl={3} md={4} xs={12}>
                <Card>
                    <CardContent>
                    
                    <Button
                                fullWidth
                                onClick={handleApplyStamp}
                                variant='contained'
                                endIcon={<Icon icon='tabler:signature' />}
                            >
                                Apply Signature
                            </Button>
                            {/* <button onClick={handleApplyStamp}>Apply Signature</button> */}
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xl={9} md={8} xs={12} >
            <div  style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', overflow:'auto' }} >
                
                            <Document file={fileUrl} onLoadSuccess={handleDocumentLoadSuccess}>
                                {Array.from(new Array(numPages), (el, index) => (
                                    <Page 
                                        key={index + 1} 
                                        pageNumber={index + 1} 
                                        width={600} 
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false} >
                                        {renderStampPreview(index + 1)}
                                        {renderDatePreview(index + 1)}
                                        
                                    </Page>
                                ))}
                                
                            </Document>
                      
                </div>

            </Grid>
           
                      
        </Grid>
    )
}


export default PDFDocumentView
