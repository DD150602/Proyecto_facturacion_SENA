import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/siderbarComponent'
import StackCumston from '../../components/stackComponent'
import { Stack, Snackbar, Alert, IconButton } from '@mui/material'
import YoutubeSearchedForIcon from '@mui/icons-material/YoutubeSearchedFor'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined'
import axios from 'axios'
import CustomModal from '../../components/modalComponent'
import EditarCliente from '../../components/editarCliente'
import HistorialCompras from '../../components/verCompras'
import AutocompleteComponent from '../../components/autocompletComponent'
import useDataPreload from '../../hooks/useDataReload'


const defaultValues = {
  numeroDocumento: ''
}

export default function ClientesAdmin() {
  const [values, setValues] = useState(defaultValues)
  const [valuesError, setValuesError] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [clientes, setClientes] = useState([])
  const [filteredClientes, setFilteredClientes] = useState([])
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const { data: clientData } = useDataPreload('cliente/todos/clientes')
  const [screenWidth, setScreenWidth] = useState(window.innerWidth)

  const handleAutocompleteChange = (name, newValue) => {
    setValues((prevValues) => ({
      ...prevValues,
      [name]: newValue
    }))
  }

  const recognizeEmptyName = (name) => {
    return submitted && values[name] === ''
  }

  function formatCop(value) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(value);
  }

  const handleSettingError = (name, error) => {
    setValuesError({ ...valuesError, [name]: error })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)

    if (values.numeroDocumento === null) {
      setFilteredClientes(clientes)
      return
    }

    if (recognizeEmptyName('numeroDocumento')) {
      handleSettingError('numeroDocumento', 'El número de documento es requerido.')
      return
    }

    const filtered = clientes.filter(cliente =>
      cliente.numero_documento_cliente === values.numeroDocumento.id
    )

    if (filtered.length > 0) {
      setFilteredClientes(filtered)
      setOpenSnackbar(true)
    } else {
      handleSettingError('numeroDocumento', 'Cliente no encontrado.')
    }
  }

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await axios.get('http://localhost:4321/gestion_cliente')
        setClientes(response.data)
        setFilteredClientes(response.data)
      } catch (error) {
        console.error('Error fetching clientes:', error.message)
      }
    }
    fetchClientes()
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  return (
    <>
      <Sidebar />
      <StackCumston>
        <div className='flex flex-col md:flex-row items-start'>
          <div className='w-full md:w-1/2 px4'>
            <p className='text-xm text-gray-500 mb-5'>Filtra a tus clientes por número de documento</p>
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <div className='w-full md:w-1/2'>
                    <AutocompleteComponent
                      options={clientData}
                      id='numeroDocumento'
                      label='Número de documento'
                      name='numeroDocumento'
                      value={values.numeroDocumento}
                      onChange={handleAutocompleteChange}
                    />
                  </div>
                  <button
                    type='submit'
                    className='w-full md:w-1/2 bg-gray-800 text-white rounded-lg py-3 px-6 hover:bg-gray-700 transition duration-300 ease-in-out font-semibold'
                  >
                    BUSCAR <YoutubeSearchedForIcon />
                  </button>
                </Stack>
              </Stack>
            </form>
          </div>
        </div>
        <div className='w-full mt-6'>
          <h2 className='text-xl font-semibold mb-4'>Todos los Clientes</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
            {filteredClientes && filteredClientes.map((cliente, index) => (
              <div key={cliente.id} className='bg-gray-800 rounded-xl shadow-lg p-8 relative overflow-hidden min-h-[400px]'>
                <div className='flex items-center mb-4 text-gray-100'>
                  {cliente.link_foto_cliente
                    ? (
                      <img src={cliente.link_foto_cliente} alt={`${cliente.primer_nombre_cliente} ${cliente.primer_apellido_cliente}`} className='w-16 h-16 rounded-full text-white' />
                    )
                    : (
                      <div className='w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center text-white text-2xl'>
                        {cliente.primer_nombre_cliente.charAt(0)}{cliente.primer_apellido_cliente.charAt(0)}
                      </div>
                    )}
                  <div className='ml-4'>
                    <h3 className='text-lg font-semibold'>{cliente.primer_nombre_cliente} {cliente.primer_apellido_cliente}</h3>
                    <p className='text-gray-100'>{cliente.numero_documento_cliente}</p>
                  </div>
                </div>
                <p className='text-gray-100 mb-2'><strong>Correo:</strong> {cliente.correo_cliente}</p>
                <p className='text-gray-100 mb-2'><strong>Dirección:</strong> {cliente.direccion_cliente}</p>
                <p className='text-gray-100 mb-2'><strong>Teléfono:</strong> {cliente.telefono_cliente}</p>
                <div className='text-center mt-5'>
                  {cliente.deuda_total === 0 ? (
                    <button className='bg-green-700 text-gray-800 font-bold py-2 px-4 rounded-full inline-flex items-center'>
                      No tiene una deuda
                    </button>
                  ) : (
                    <button className='bg-yellow-500 text-gray-800 font-bold py-2 px-4 rounded-full inline-flex items-center'>
                      Deuda Total: {formatCop(cliente.deuda_total)}
                    </button>
                  )}
                </div>
                <div className='absolute bottom-0 left-0 right-0'>
                  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 300' className='w-full h-auto'>
                    <path fill='#ffffff' fillOpacity='1' d='M0,288L40,250.7C80,213,160,139,240,144C320,149,400,235,480,240C560,245,640,171,720,160C800,149,880,203,960,192C1040,181,1120,107,1200,101.3C1280,96,1360,160,1400,192L1440,224L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z' />
                    <foreignObject x='0' y='220' width='100%' height='200'>
                      <div className='flex justify-center mt-2 gap-20' xmlns='http://www.w3.org/1999/xhtml'>
                        <IconButton className='text-white mx-4' style={{ transform: 'scale(2.0)' }}>
                          <CustomModal
                            icon={<ShoppingBagOutlinedIcon />} bgColor='success' tooltip='Historial de compra' padding={0}
                            top={screenWidth <= 1400 ? '0%' : '15%'}
                            left={screenWidth <= 1400 ? '15%' : '25%'}
                          ><><HistorialCompras id={cliente.id} /></>
                          </CustomModal>
                        </IconButton>
                        <IconButton className='text-white mx-4' style={{ transform: 'scale(2.0)' }}>
                          <CustomModal
                            icon={<ManageAccountsOutlinedIcon />} tooltip='Editar Cliente' padding={0}
                            top={screenWidth <= 1400 ? '0%' : '15%'}
                            left={screenWidth <= 1400 ? '15%' : '25%'}
                          ><EditarCliente id={cliente.id} />
                          </CustomModal>
                        </IconButton>
                      </div>
                    </foreignObject>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </StackCumston>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity='success' sx={{ width: '100%' }}>
          Datos encontrados
        </Alert>
      </Snackbar>
    </>
  )
}
