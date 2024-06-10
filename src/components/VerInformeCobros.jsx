import { Alert, Fade, Grid } from '@mui/material'
import React, { useEffect, useState } from 'react'
import useForm from '../hooks/UseForm'

import { getDataById } from '../utils/getDataById'
import InputDate from './dateComponent'
import InfoIcon from '@mui/icons-material/Info'

import Pago from '../assets/img/payment.png'
import Validado from '../assets/img/checked2.png'
import Danger from '../assets/img/danger.png'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import dayjs from 'dayjs'
const defaultValues = {
  nombre_usuario: '',
  correo_usuario: '',
  telefono_usuario: '',
  infoFacturas: []
}

export default function VerInformeCobrosComponent (porps) {
  const { id } = porps
  const { values, setValues } = useForm(defaultValues)
  const [fechaInforme, setFechaInforme] = useState('')
  const [mostrarAlerta, setMostrarAlerta] = useState(false)
  const [mensajeError, setMensajeError] = useState(false)

  useEffect(() => {
    const bringData = async () => {
      const fecha = `${id}?month=${fechaInforme.split('-')[1]}&year=${fechaInforme.split('-')[0]}`
      const { todosDatos, validacion } = await getDataById({ id: fechaInforme === '' ? id : fecha, endpoind: 'reporteVentas/collect', defaultValues })
      if (validacion) {
        if (todosDatos instanceof Error) {
          setMostrarAlerta(true)
          setMensajeError(todosDatos)
        } else {
          setValues(todosDatos)
        }
      }
    }
    bringData()
  }, [fechaInforme])

  function formatCop (value) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(value)
  }
  return (
    <>
      <form className='rounded-lg'>
        <div className='max-w-6xl mx-auto p-4'>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            <div className='bg-green-200 shadow-lg rounded-lg p-6 flex items-center'>
              <img src={Pago} alt='Pago' className='w-16 h-16 mr-4' />
              <div>
                <h2 className='text-xl font-semibold text-gray-700'>Valor transacciones realizadas</h2>
                <div className='flex items-center'>
                  <AttachMoneyIcon className='text-green-500 mr-1' />
                  <span className='text-2xl text-green-500 font-bold'>{formatCop(values.totalTransacciones)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className='mt-6'>
            <p className='bg-blue-100 text-blue-400 p-4 rounded-lg flex items-center mb-5'>
              <InfoIcon className='mr-2' />
              <span>Si hay un ícono de check, el pago fue aprovado; de lo contrario, se muestra un ícono de alerta.</span>
            </p>
            {mostrarAlerta &&
              <Fade in={mostrarAlerta} timeout={300} className='mb-4'>
                <Alert severity='error' variant='outlined' sx={{ width: '98%' }}>
                  {mensajeError}
                </Alert>
              </Fade>}
            <p className='text-sm text-gray-500 mb-5'>Filtra las ventas por mes y año</p>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <InputDate
                  id='fechaInforme'
                  label='Fecha del reporte'
                  name='fechaInforme'
                  fecha={fechaInforme}
                  onChange={(name, value) => {
                    setFechaInforme(value)
                  }}
                  views={['month', 'year']}
                  required
                  disabled={false}
                />
              </Grid>
            </Grid>
          </div>
          <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-scroll h-[400px] pb-3'>
            {values.infoTransactions && values.infoTransactions.map(row => (
              <div key={row.id} className='bg-white shadow-lg rounded-lg p-4 relative'>
                {row.estado_transaccion === 1
                  ? (
                    <>
                      <img src={Validado} alt='Pagado' className='w-20 h-20 absolute tpx-4  bottom-4 right-4 opacity-40' />
                    </>
                    )
                  : (
                    <>
                      <img src={Danger} alt='Pagado' className='w-20 h-20 absolute tpx-4  bottom-4 right-4 opacity-40' />
                    </>
                    )}
                <h3 className='text-lg font-semibold mb-2'>Entidad Bancaria: {row.entidad_bancaria}</h3>
                <p className='text-gray-700'><strong>Fecha Transaccion:</strong> {dayjs(row.fecha_transaccion).format('DD-MM-YYYY')}</p>
                <p className='text-gray-700'><strong>Tipo Transaccion:</strong> {row.descripcion_transaccion}</p>
                <p className='text-gray-700'><strong>Valor Transaccion:</strong> {formatCop(row.valor_transaccion)}</p>
                <p className='text-gray-700'><strong>Pagado Por:</strong> {row.nombre_usuario}</p>
                <p className='text-gray-700'><strong>Factura Asignada:</strong> {row.id_factura}</p>
              </div>
            ))}
          </div>
        </div>
      </form>
    </>
  )
}
