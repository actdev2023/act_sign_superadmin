// ** React Imports
import { useEffect, useState, useCallback, ChangeEvent } from 'react'
import {PDFDocument, PDFImage, degrees} from 'pdf-lib';
import {Document, Page, pdfjs } from 'react-pdf';
import { config } from "../../configs/config";
import { fetchSignature } from 'src/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';



const { API_URL } = config;

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import { DataGrid, GridColumns, GridRenderCellParams, GridRowId, GridRowsProp, GridSortModel, GridValueGetterParams, GridRowSelectionCheckboxParams } from '@mui/x-data-grid'

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

interface PDFData {
  id: number;
  filename: string;
  x: number;
  y: number;
  width: number;
  height: number;
  date_text: string;
  date_x: number;
  date_y: number;
  date_size: number;
  page_number: boolean;
  page_start: number;
  page_end: number;
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
  0: { title: 'unsigned', color: 'error' },
  1: { title: 'signed', color: 'success' },
  3: { title: 'rejected', color: 'error' },
  4: { title: 'resigned', color: 'warning' },
  5: { title: 'applied', color: 'info' }
}



const TablePdfServerSide: React.FC<FilesTableProps> = ({ onView }) => {

    const columns: GridColumns = [
        {
          flex: 0.25,
          minWidth: 250,
          field: 'title',
          headerName: 'Title',
          renderCell: (params: GridRenderCellParams) => {
            const { row } = params
      
            return (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {/* {renderClient(params)} */}
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
                    {row.title}
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
          flex: 0.195,
          minWidth: 200,
          field: 'pfd',
          headerName: 'PDF Files',
          renderCell: (params: GridRenderCellParams) => (
            <Typography variant='body2' sx={{ color: 'text.primary' }}>
              {params.row.filename}
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
        },
        {
          flex: 0.105,
          field: 'action',
          minWidth: 50,
          headerName: 'Actions',
          renderCell: (params: GridRenderCellParams) => (
            <Button size='small' variant='outlined' color='primary' onClick={() => onView(params.row.id as string)}>View</Button>
          ),
        }
        
      ]
  // ** State
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState<number>(0)
  const [sort, setSort] = useState<SortType>('asc')
  const [pageSize, setPageSize] = useState<number>(7)
  const [rows, setRows] = useState<DataGridRowType[]>([])
  const [searchValue, setSearchValue] = useState<string>('')
  const [sortColumn, setSortColumn] = useState<string>('title')
  const [selectedRows, setSelectedRows] = useState<GridRowId[]>([]);
  const [pdfDatas, setPdfDatas] = useState<PDFData[]>([]);
  const [stampedPdfURLs, setStampedPdfURLs] = useState<string[]>([]);
  const [signature, setSignature] = useState('');
  const [fileUrl, setFileUrl] = useState<string>('');
  const router = useRouter();

  function loadServerRows(currentPage: number, data: DataGridRowType[]) {
    return data.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
  }

  const fetchTableData = useCallback(
    async (sort: SortType, query: string, column: string) => {
        try {
            const response = await fetch(`${API_URL}/api/files?status=0&query=${query}&sort=${sort}&column=${column}`);
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
    const fetchData = async () => {
      try {
          const signature = await fetchSignature('1');
          setSignature(signature);
      } catch (error) {
          console.error('Error fetching signature', error);
      }
  };

  fetchData();
    async function fetchPDFUrls() {
      try {
        const response = await fetch(`${API_URL}/api/unsigned/files`);
        if (!response.ok) {
            throw new Error('Error fetching table data');
        }
        const data: PDFData[] = await response.json();
        console.info(data);
        setPdfDatas(data);
    } catch (error) {
        console.error(error);
    }

    }
    fetchPDFUrls();
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

  // const handleSelectionChange = (params: GridRowSelectionCheckboxParams) => {
  //   setSelectedRows(params.value);
  // };

  const handleSignAllClick = async () => {
    
      const newStampedPdfURLs: string[] = [];
      const stampedBlobs: Blob[] = [];

      for (const pdfData2 of pdfDatas) {
      const pdfBytes = await fetch(`http://localhost:8080/uploads/documents/${pdfData2.filename}`).then((response) => response.arrayBuffer());
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
      if(pdfData2.page_number) {
          for (let i=0; i < pages.length; i++) {
              const page = pages[i];

              const stamDims = stampImage2.scale(0.25);
              const { width, height } = page.getSize();
              if(stampImage2){
                const x = Number(pdfData2.x);
                const y = Number(pdfData2.y);
                const stampHeight = Number(pdfData2.height);
                const stampWidth = Number(pdfData2.width);
                page.drawImage(stampImage2, {
                    x: x ?? 0,
                    y:height - (y ?? 0) - (stampHeight ?? 0),
                    width:  stampWidth ?? 0,
                    height: stampHeight ?? 0,
                    rotate: degrees(0),
                    opacity: 0.8,
  
                });
                }
                if(pdfData2.date_text){
                  const date_x = Number(pdfData2.date_x);
                  const date_y = Number(pdfData2.date_y);
                  const date_size = Number(pdfData2.date_size);
                  
                    
                page.drawText(pdfData2.date_text, {
                    x: date_x ?? 0,
                    y: height- (date_y ?? 0),
                    size: date_size ?? 0,
                    rotate: degrees(0),
                    opacity: 1,
  
                });
                }
          }

      }
      else {
          for (let i=pdfData2.page_start - 1; i < pdfData2.page_end; i++) {
              const page = pages[i];

              const stamDims = stampImage2.scale(0.25);
              const { width, height } = page.getSize();
              if(stampImage2){
                const x = Number(pdfData2.x);
                const y = Number(pdfData2.y);
                const stampHeight = Number(pdfData2.height);
                const stampWidth = Number(pdfData2.width);
                page.drawImage(stampImage2, {
                    x: x ?? 0,
                    y:height - (y ?? 0) - (stampHeight ?? 0),
                    width:  stampWidth ?? 0,
                    height: stampHeight ?? 0,
                    rotate: degrees(0),
                    opacity: 0.8,
  
                });
                }
                if(pdfData2.date_text){
                  const date_x = Number(pdfData2.date_x);
                  const date_y = Number(pdfData2.date_y);
                  const date_size = Number(pdfData2.date_size);
                  
                    
                page.drawText(pdfData2.date_text, {
                    x: date_x ?? 0,
                    y: height- (date_y ?? 0),
                    size: date_size ?? 0,
                    rotate: degrees(0),
                    opacity: 1,
  
                });
                }
          }
      }

      //save the modified pdf as a new file
      const modifiedPdfData = await pdfDoc.save();
      const blob = new Blob([modifiedPdfData], { type: 'application/pdf' });
      stampedBlobs.push(blob);
      const blobURL = URL.createObjectURL(blob);
      newStampedPdfURLs.push(blobURL);

    }
      setStampedPdfURLs(newStampedPdfURLs);

      const formData = new FormData();
      stampedBlobs.forEach((pdfBlob, index) => {
        formData.append('pdfs', pdfBlob, `signed-pdf-${index}.pdf`);
      });

      const pdfIds = pdfDatas.map(pdfData2 => pdfData2.id);
      formData.append('ids', JSON.stringify(pdfIds));

      try {

        const response2 = await fetch(`${API_URL}/api/bulk/upload-and-update-signed-pdf`, {
          method: 'POST',
          body: formData,
      });

      if (!response2.ok) {
          throw new Error('Failed to upload signed PDFs');

      }

      const data = await response2.json();
      console.log(data.message);

      
      

          
          toast.success('Signed All PDF successful');
          router.push('/signed-documents/');

          //Generate URL for the modified PDF
          //const modifiedPdfUrl = URL.createObjectURL(new Blob([modifiedPdfData], { type: 'application/pdf' }));

          //Open new window
          //window.open(modifiedPdfUrl);
      
    
  } catch (error) {
      console.error('Error applying signature and uploading PDF:', error);
  }


  };

  
  const handleSearch = (value: string) => {
    setSearchValue(value)
    fetchTableData(sort, value, sortColumn)
  }

  const handleSelectionChange = (params: GridRowSelectionCheckboxParams) => {
    setSelectedRows(params.id as unknown as number[]);
  }

  return (
    <Card>
      
      <Button variant='contained' color='primary' onClick={handleSignAllClick} sx={{ ml:5, mt:4 }}>Sign All</Button>
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

export default TablePdfServerSide