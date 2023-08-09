// ** React import
import React, {useRef, ChangeEvent, useState, useEffect, useCallback, Fragment} from 'react';
import {PDFDocument, PDFImage, degrees} from 'pdf-lib';
import {Document, Page, pdfjs} from 'react-pdf';
import { registerUser } from 'src/lib/api';
import { config } from "../../configs/config";
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';



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

// ** Icon Imports
import Icon from 'src/@core/components/icon';

interface State {
    password: string
    showPassword: boolean
  
}
interface CPState {
    cpassword: string
    cshowPassword: boolean
  
}

const Form = styled('form')(() => ({
   minWidth: 600,
   padding: 30,
   borderRadius: '10px',
   border: `1px solid #333` 
}))

const AddUserPage = () => {

    const [values, setValues] = useState<State>({
        password: '',
        showPassword: false
    });
    const [cValues, setCValues] = useState<CPState>({
        cpassword: '',
        cshowPassword: false
    });
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();


    const handleChange = (prop: keyof State) => (event: ChangeEvent<HTMLInputElement>) => {
        setValues({ ...values, [prop]: event.target.value })
    }
    const handleChangeCP = (prop: keyof CPState) => (event: ChangeEvent<HTMLInputElement>) => {
        setCValues({ ...cValues, [prop]: event.target.value })
    }

    const handleClickShowPassword = () => {
        setValues({ ...values, showPassword: !values.showPassword })
    }

    const handleClickShowCPassword = () => {
        setCValues({ ...cValues, cshowPassword: !cValues.cshowPassword })
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!username || !email || !values.password || !cValues.cpassword) {
            setErrorMessage('Please fill in all fields');
            return;
        }

        if (values.password !== cValues.cpassword) {
            setErrorMessage('Passwprd do no match');
            return;
        }

        try {
            await registerUser(username, email, values.password);

            toast.success('Registration successfull');
            router.push('/');

        } catch (error) {
            console.error('Error registering user:', error);
            toast.error('Failed to register user');
            
        }
    }

    return (
        <Card>
            <CardHeader title='' />
            <CardContent sx={{ minHeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Form onSubmit={handleSubmit}  >
                    <Grid item xs={12} >
                        <TextField 
                            fullWidth 
                            id='outlined-basic' 
                            label='Username' 
                            type='text'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            sx={{ mb: 4}} 
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField 
                            fullWidth 
                            id='outlined-basic' 
                            label='Email' 
                            type='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{ mb: 4}} 
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel htmlFor='form-layouts-alignment-password'>Password</InputLabel>
                            <OutlinedInput
                                sx={{ mb: 4}} 
                                label='Password'
                                value={values.password}
                                onChange={handleChange('password')}
                                id='outlined-basic'
                                type={values.showPassword ? 'text' : 'password'}
                                endAdornment={
                                    <InputAdornment position='end'>
                                        <IconButton
                                            edge='end'
                                            onClick={handleClickShowPassword}
                                            onMouseDown={e => e.preventDefault()}
                                            aria-label='toggle password visibility'
                                        >
                                            <Icon icon={values.showPassword ? 'tabler:eye' : 'tabler:eye-off'} />
                                        </IconButton>
                                    </InputAdornment>
                                }
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel htmlFor='form-layouts-alignment-password'>Confirm Password</InputLabel>
                            <OutlinedInput
                                sx={{ mb: 4}} 
                                label='Confirm Password'
                                value={cValues.cpassword}
                                onChange={handleChangeCP('cpassword')}
                                id='outlined-basic'
                                type={cValues.cshowPassword ? 'text' : 'password'}
                                endAdornment={
                                    <InputAdornment position='end'>
                                        <IconButton
                                            edge='end'
                                            onClick={handleClickShowCPassword}
                                            onMouseDown={e => e.preventDefault()}
                                            aria-label='toggle password visibility'
                                        >
                                            <Icon icon={cValues.cshowPassword ? 'tabler:eye' : 'tabler:eye-off'} />
                                        </IconButton>
                                    </InputAdornment>
                                }
                            />
                        </FormControl>
                    </Grid>
                    <Button
                        fullWidth
                        type='submit'
                        variant='contained'
                    >
                        Add Account
                    </Button>


                </Form>
            </CardContent>
        </Card>
    )
}

export default AddUserPage;