// ** React Imports
import { useEffect, useState, useCallback, ChangeEvent } from 'react'
import { config } from "../../configs/config";
import ActionsColumn from './ActionsColumn';



const { API_URL } = config;

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import { DataGrid, GridColumns, GridRenderCellParams, GridSortModel, GridValueGetterParams } from '@mui/x-data-grid'

// ** ThirdParty Components
import axios from 'axios'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import ServerSideToolbar from 'src/views/table/ServerSideToolbar'

// ** Types Imports
import { ThemeColor } from 'src/@core/layouts/types'
import { DataGridRowType } from 'src/@fake-db/types'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'
import { Button } from '@mui/material'

interface StatusObj {
  [key: number]: {
    title: string
    color: ThemeColor
  }
}

interface FilesTableProps {
    
    onView: (fileId: string) => void;
}

type SortType = 'asc' | 'desc' | undefined | null

// ** renders client column
const renderClient = (params: GridRenderCellParams) => {
  const { row } = params
  const stateNum = Math.floor(Math.random() * 6)
  const states = ['success', 'error', 'warning', 'info', 'primary', 'secondary']
  const color = states[stateNum]

//   if (row.avatar.length) {
//     return <CustomAvatar src={`/images/avatars/${row.avatar}`} sx={{ mr: 3, width: '1.875rem', height: '1.875rem' }} />
//   } else {
//     return (
//       <CustomAvatar
//         skin='light'
//         color={color as ThemeColor}
//         sx={{ mr: 3, fontSize: '.8rem', width: '1.875rem', height: '1.875rem' }}
//       >
//         {getInitials(row.full_name ? row.full_name : 'John Doe')}
//       </CustomAvatar>
//     )
//   }
}

const statusObj: StatusObj = {
  0: { title: 'active', color: 'success' },
  1: { title: 'signed', color: 'error' },
  3: { title: 'rejected', color: 'error' },
  4: { title: 'resigned', color: 'warning' },
  5: { title: 'applied', color: 'info' }
}



const TableUserServerSide: React.FC<FilesTableProps> = ({ onView }) => {

    const columns: GridColumns = [
        {
          flex: 0.25,
          minWidth: 250,
          field: 'username',
          headerName: 'Name',
          renderCell: (params: GridRenderCellParams) => {
            const { row } = params
      
            return (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {/* {renderClient(params)} */}
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
                    {row.username}
                  </Typography>
                 
                </Box>
              </Box>
            )
          }
        },
        {
          flex: 0.175,
          minWidth: 120,
          headerName: 'Date',
          field: 'start_date',
          renderCell: (params: GridRenderCellParams) => (
            <Typography variant='body2' sx={{ color: 'text.primary' }}>
              {params.row.created_at}
            </Typography>
          )
        },
        {
          flex: 0.105,
          minWidth: 50,
          field: 'status',
          headerName: 'Status',
          renderCell: (params: GridRenderCellParams) => {
            const status = statusObj[params.row.status]
      
            return (
              <CustomChip
                rounded
                size='small'
                skin='light'
                color={status.color}
                label={status.title}
                sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
              />
            )
          }
        }
        
      ]
  // ** State
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState<number>(0)
  const [sort, setSort] = useState<SortType>('asc')
  const [pageSize, setPageSize] = useState<number>(7)
  const [rows, setRows] = useState<DataGridRowType[]>([])
  const [searchValue, setSearchValue] = useState<string>('')
  const [sortColumn, setSortColumn] = useState<string>('username')

  function loadServerRows(currentPage: number, data: DataGridRowType[]) {
    return data.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
  }

  const fetchTableData = useCallback(
    async (sort: SortType, query: string, column: string) => {
        try {
            const response = await fetch(`${API_URL}/api/users?status=0&query=${query}&sort=${sort}&column=${column}`);
            if (!response.ok) {
                throw new Error('Error fetching table data');
            }
            const data = await response.json();
            
            setTotal(data.total);
            setRows(loadServerRows(page, data.details));
        } catch (error) {
            console.error(error);
        }
      
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, pageSize]
  )

  useEffect(() => {
    fetchTableData(sort, searchValue, sortColumn)
  }, [fetchTableData, searchValue, sort, sortColumn])

  const handleSortModel = (newModel: GridSortModel) => {
    if (newModel.length) {
      setSort(newModel[0].sort)
      setSortColumn(newModel[0].field)
      fetchTableData(newModel[0].sort, searchValue, newModel[0].field)
    } else {
      setSort('asc')
      setSortColumn('title')
    }
  }


  const handleSearch = (value: string) => {
    setSearchValue(value)
    fetchTableData(sort, value, sortColumn)
  }

  return (
    <Card>
      <CardHeader title='' />
      <DataGrid
        autoHeight
        pagination
        rows={rows}
        rowCount={total}
        columns={columns}
        checkboxSelection
        pageSize={pageSize}
        sortingMode='server'
        paginationMode='server'
        onSortModelChange={handleSortModel}
        rowsPerPageOptions={[7, 10, 25, 50]}
        onPageChange={newPage => setPage(newPage)}
        components={{ Toolbar: ServerSideToolbar }}
        onPageSizeChange={newPageSize => setPageSize(newPageSize)}
        componentsProps={{
          baseButton: {
            variant: 'outlined'
          },
          toolbar: {
            value: searchValue,
            clearSearch: () => handleSearch(''),
            onChange: (event: ChangeEvent<HTMLInputElement>) => handleSearch(event.target.value)
          }
        }}
      />
    </Card>
  )
}

export default TableUserServerSide