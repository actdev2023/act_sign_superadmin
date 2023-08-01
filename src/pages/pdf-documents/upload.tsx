// ** React import
import React, {useRef, ChangeEvent, useState, useEffect, useCallback, Fragment} from 'react';
import {PDFDocument, PDFImage, degrees} from 'pdf-lib';
import {Document, Page, pdfjs} from 'react-pdf';
import { fetchSignature } from 'src/lib/api';
import { config } from "../../configs/config";
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';
import Select from 'react-select';
import SelectWithSearch from 'src/views/select/SelectWithSearch';



const { API_URL } = config;

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
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';

// ** Icon Imports
import Icon from 'src/@core/components/icon';
import DatePicker, { ReactDatePickerProps } from 'react-datepicker';
import CustomInput from '../../views/pickers/PickersCustomInput';
import { DateType } from 'src/types/forms/reactDatepickerTypes';


pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface Stamp {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface DateText {
    date_x: number;
    date_y: number;
    date_size: number;
}

interface Option {
    value: number,
    label: string
}



const Img = styled('img')(({ theme }) => ({
    width: 48,
    height: 48,
    marginBottom: theme.spacing(8.5)
}))

const PDFDocumentUpload = ({ popperPlacement }: { popperPlacement: ReactDatePickerProps['popperPlacement']}) => {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
    const [numPages, setNumPages] = useState(0);
    const [signature, setSignature] = useState('');
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [stamp, setStamp] = useState<Stamp>({
        x: 400,
        y: 650,
        width: 200,
        height: 50,
    });
    const [dateText, setDateText] = useState<DateText>({
        date_x: 0,
        date_y: 650,
        date_size: 20,
    });
    const [title, setTitle] = useState<string>('');
    const [startPage, setStartPage] = useState(1);
    const [endPage, setEndPage] = useState(1);
    const [applyToAllPages, setApplyToAllPages] = useState(true);
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [options, setOptions] = useState<Option[]>([]);
    const [selectedOption, setSelectedOption] = useState<Option | null>(null);
    const [date, setDate] = useState<DateType>(new Date())

    const handleSelectChange = (selectedOption: Option | null) => {
        setSelectedOption(selectedOption);
    };

    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === 'true';
        setApplyToAllPages(value);
    };

    const theme = useTheme();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (uploadedFile && selectedOption) {
            const formData = new FormData();
            formData.append('file', uploadedFile);
            formData.append('x', stamp.x.toString());
            formData.append('y', stamp.y.toString());
            formData.append('width', stamp.width.toString());
            formData.append('height', stamp.height.toString());
            formData.append('title', title);
            formData.append('page_number', applyToAllPages ? '1' : '0');
            formData.append('page_start', startPage.toString());
            formData.append('page_end', endPage.toString());
            formData.append('user_id', String(selectedOption.value));
            formData.append('date_text', String(date?.toLocaleDateString()));
            formData.append('date_x', dateText.date_x.toString());
            formData.append('date_y', dateText.date_y.toString());
            formData.append('date_size', dateText.date_size.toString());

            try {
                await fetch(`${API_URL}/api/files`, {
                    method: 'POST',
                    body: formData,
                });

                

                console.log('File and stamp information saved to the database!');
                toast.success('File and stamp information saved successfully');
                router.push('/');
            } catch (error) {
                console.log('Error saving file and stamp information:', error);
                toast.error('File and stamp information saved successfully');
            }

        }

    };
    
    const onDrop = async (acceptFiles: File[]) => {
        const file = acceptFiles[0];
        setUploadedFile(file);
        const fileUrl = URL.createObjectURL(file);
        setPdfUrl(fileUrl);

        setStamp({
            x: 400,
            y: 650,
            width: 200,
            height: 50,
        });

        try {
            const pdfData = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfData);
            const pagesCount = pdfDoc.getPageCount();
            setNumPages(pagesCount);
        } catch (error) {
            console.log('Error loading PDF:', error);
        }
    };

    const handleStampChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setStamp((prevStamp) => ({
            ...prevStamp,
            [name]: parseInt(value),
        }));
    };

    const handleDateTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDateText((prevStamp) => ({
            ...prevStamp,
            [name]: parseInt(value),
        }));
    };

    const renderStampPreview = (pageNumber: number) => {
        if(applyToAllPages || pageNumber >= startPage && pageNumber <= endPage){
            const { x, y, width, height } = stamp;
            return (
                <div
                    className="stamp-preview"
                    style={{ left: x, top: y, width, height, position: 'absolute', border: '2px dashed red' }}
                >
                    Signature Preview
                </div>
            );
        }
        return null;
    }

    const renderDatePreview = (pageNumber: number) => {
        if(applyToAllPages || pageNumber >= startPage && pageNumber <= endPage){
            const { date_x, date_y, date_size } = dateText;
            return (
                <div
                    className="stamp-preview"
                    style={{ left: date_x, top: date_y, fontSize: date_size+'px', position: 'absolute', border: '2px dashed red' }}
                >
                    {date?.toLocaleDateString()}
                </div>
            );
        }
        return null;
    }
    
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    useEffect(() => {

        fetch(`${API_URL}/api/users/options`)
            .then((response) => response.json())
            .then((data) => setOptions(data))
            .catch((error) => console.error('Error fetching options:', error));
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
    }, []);

    

    

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
                    <form onSubmit={handleSubmit}>
                        <CardContent>
                            <SelectWithSearch
                                onSelectChange={handleSelectChange}
                                options={options}
                                
                            />
                            <TextField 
                                fullWidth 
                                id='outlined-basic-1' 
                                label='Title'
                                type='text'
                                value={title}
                                onChange={(e) => setTitle(e.target.value)} 
                                sx={{ mb: 4, mt: 4}} />
                            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`} style={{ marginBottom: '15px' }}>
                                <input {...getInputProps()} />
                                <Box sx={{ display: 'flex', textAlign: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                    
                                    {isDragActive ? (
                                        <p>Drop the PDF File here...</p>
                                    ) : (
                                        <p>Drag and drop a PDF file here, or click to select a file.</p>
                                    )}
                                    <style>{`
                                        .dropzone {
                                            border: 2px dashed rgba(47, 43, 61, 0.16);
                                            padding: 0.5rem;
                                            border-radius: 6px;
                                            cursor: pointer;
                                            min-height: 150px;
                                            display:flex;
                                            justify-content: center;
                                            flex-wrap:wrap;
                                            align-items: center;
                                        }
                                    `}

                                    </style>
                                </Box>
                                
                            </div>
                            <Typography variant='body2' sx={{ mb: 4}}>
                            Set Signature location & size
                            </Typography>
                            <Grid container spacing={4} sx={{ mb: 4 }}>
                                <Grid item xl={6} md={6} xs={12} >
                                    <TextField
                                        id='outlined-basic-2' 
                                        label='X'
                                        type='number'
                                        name='x'
                                        value={stamp.x}
                                        onChange={handleStampChange}
                                    />
                                </Grid>
                                <Grid item xl={6} md={6} xs={12} >
                                    <TextField
                                        id='outlined-basic-3' 
                                        label='Y'
                                        type='number'
                                        name='y'
                                        value={stamp.y}
                                        onChange={handleStampChange}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={4} sx={{ mb: 4 }}>
                                <Grid item xl={6} md={6} xs={12} >
                                    <TextField
                                        id='outlined-basic-4' 
                                        label='Width'
                                        type='number'
                                        name='width'
                                        value={stamp.width}
                                        onChange={handleStampChange}
                                    />
                                </Grid>
                                <Grid item xl={6} md={6} xs={12} >
                                    <TextField
                                        id='outlined-basic-5' 
                                        label='Height'
                                        type='number'
                                        name='height'
                                        value={stamp.height}
                                        onChange={handleStampChange}
                                    />
                                </Grid>
                                
                            </Grid>
                            <Typography variant='body2' sx={{ mb: 4}}>
                            Set Date location & size
                            </Typography>
                            <Grid container spacing={4} sx={{ mb: 4 }}>
                                <Grid item xl={12} md={12} xs={12} >
                                    <DatePicker
                                        selected={date}
                                    
                                        id='basic-input'
                                        popperPlacement={popperPlacement}
                                        onChange={(date: Date) => setDate(date)}
                                        placeholderText='Click to select date'
                                        customInput={<CustomInput />}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={4} sx={{ mb: 4 }}>
                                <Grid item xl={4} md={4} xs={12} >
                                    <TextField
                                        id='outlined-basic-6' 
                                        label='X'
                                        type='number'
                                        name='date_x'
                                        value={dateText.date_x}
                                        onChange={handleDateTextChange}
                                    />
                                </Grid>
                                <Grid item xl={4} md={4} xs={12} >
                                    <TextField
                                        id='outlined-basic' 
                                        label='Y'
                                        type='number'
                                        name='y'
                                        value={dateText.date_y}
                                        onChange={handleDateTextChange}
                                    />
                                </Grid>
                                <Grid item xl={4} md={4} xs={12} >
                                    <TextField
                                        id='outlined-basic' 
                                        label='Text Size'
                                        type='number'
                                        name='date_size'
                                        value={dateText.date_size}
                                        onChange={handleDateTextChange}
                                    />
                                </Grid>
                            </Grid>
                            

                            <Typography variant='body2' sx={{ mb: 4}}>
                                Set Page Number
                            </Typography>
                            <Grid container spacing={4} sx={{ mb: 4 }}>
                                <Grid item xl={12} md={12} xs={12} >
                                    <RadioGroup
                                        aria-label='Page Number'
                                        name='pageNumber'
                                        value={applyToAllPages ? 'true' : 'false'}
                                        onChange={handleRadioChange}
                                        row
                                    >
                                        <FormControlLabel value="true" control={<Radio />} label="All Pages" />
                                        <FormControlLabel value="false" control={<Radio />} label="Page Range" />
                                    </RadioGroup>
                                </Grid>
                                {!applyToAllPages && (
                                    <>
                                        <Grid item xl={6} md={6} xs={12} >
                                            <TextField
                                                id='outlined-basic' 
                                                label='Start Page'
                                                type='number'
                                                name='startpage'
                                                value={startPage}
                                                onChange={(e) => setStartPage(parseInt(e.target.value))}
                                            />
                                        </Grid>
                                        <Grid item xl={6} md={6} xs={12} >
                                            <TextField
                                                id='outlined-basic' 
                                                label='End Page'
                                                type='number'
                                                name='endpage'
                                                value={endPage}
                                                onChange={(e) => setEndPage(parseInt(e.target.value))}
                                            />
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                            <Button
                                fullWidth
                                type='submit'
                                variant='contained'
                                endIcon={<Icon icon='tabler:upload' />}
                            >
                                Upload
                            </Button>
                            {/* <button onClick={handleApplyStamp}>Apply Signature</button> */}
                        </CardContent>
                    </form>
                </Card>
            </Grid>
            <Grid item xl={9} md={8} xs={12} >
            <div {...getRootProps()}  style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', overflow:'auto' }} >
                {pdfUrl && (
                        <>
                            <Document file={pdfUrl} onLoadSuccess={handleDocumentLoadSuccess}>
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
                        
                        </>
                    )}
                </div>

            </Grid>
           
                      
        </Grid>
    )
}

export default PDFDocumentUpload
