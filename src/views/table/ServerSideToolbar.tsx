// ** React Imports
import { ChangeEvent } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import { GridToolbarExport, GridToolbarFilterButton, GridToolbarColumnsButton } from '@mui/x-data-grid'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

interface Props {
  value: string
  clearSearch: () => void
  onChange: (e: ChangeEvent) => void
}

const ServerSideToolbar = (props: Props) => {
  return (
    <Box
      sx={{
        gap: 2,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'start',
        p: theme => theme.spacing(2, 5, 4, 5)
      }}
    >
       <GridToolbarFilterButton  /> 
       <GridToolbarExport printOptions={{ disableToolbarButton: true }} />
       <GridToolbarColumnsButton />
      <TextField
        size='small'
        value={props.value}
        onChange={props.onChange}
        placeholder='Search…'
        InputProps={{
          startAdornment: (
            <Box sx={{ mr: 2, display: 'flex' }}>
              <Icon icon='tabler:search' fontSize={20} />
            </Box>
          ),
          endAdornment: (
            <IconButton size='small' title='Clear' aria-label='Clear' onClick={props.clearSearch}>
              <Icon icon='tabler:x' fontSize={20} />
            </IconButton>
          )
        }}
        sx={{
          width: {
            xs: 1,
            sm: 'auto'
          },
          marginLeft: 'auto',
          '& .MuiInputBase-root > svg': {
            mr: 2
          }
        }}
      />
      <style>{`
      .css-i4bv87-MuiSvgIcon-root {
        font-size: 1rem;
      }`
        }
        
        </style>
    </Box>
    

    

  )
}

export default ServerSideToolbar