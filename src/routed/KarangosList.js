import * as React from 'react'
import axios from 'axios'

import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { makeStyles } from '@mui/styles'
import Toolbar from '@mui/material/Toolbar'
import Button from '@mui/material/Button'
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useHistory } from 'react-router-dom'
import ConfirmDialog from '../ui/ConfirmDialog'
import Snackbar from '@mui/material/Snackbar';

const useStyles = makeStyles(theme => ({
  dataGrid: {
    '& .MuiDataGrid-row button': {
      visibility: 'hidden'
    },
    '& .MuiDataGrid-row:hover button': {
      visibility: 'visible'
    }
  },
  toolbar: {
    padding: 0,
    justifyContent: 'flex-end',
    margin: '20px 0'
  }
}))

export default function KarangosList() {

  const columns = [
    { 
      field: 'id', 
      headerName: 'Cód.', 
      width: 100,
      type: 'number' 
    },
    { 
      field: 'marca', 
      headerName: 'Marca', 
      width: 150,
      type: 'vchar' 
    },
    { 
      field: 'modelo', 
      headerName: 'Modelo', 
      width: 200 
    },
    {
      field: 'cor',
      headerName: 'Cor',
      width: 150,
    },
    {
      field: 'ano_fabricacao',
      headerName: 'Ano de Fabricação',
      width: 150
    },
    {
      field: 'importado',
      headerName: 'Importado',
      width: 100,
      type:'boolean'
    },
    {
      field: 'placa',
      headerName: 'Placa',
      width: 100
    },
    {
      field: 'preco',
      headerName: 'Preço',
      width: 100,
      type: 'decimal'
    },
    {
      field: 'editar',
      headerName: 'Editar',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: params => (
        <IconButton 
          aria-label="Editar"
          onClick={() => history.push(`/karangos/${params.id}`)}
        >
          <EditIcon />
        </IconButton>
      )
    },
    {
      field: 'excluir',
      headerName: 'Excluir',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: params => (
        <IconButton 
          aria-label="Excluir"
          onClick={() => {console.log({params}); handleDeleteClick(params.id)}}
        >
          <DeleteForeverIcon color="error" />
        </IconButton>
      )
    }  
  ];

  const classes = useStyles()

  const history = useHistory()

  const [state, setState] = React.useState({
    karangos: [],
    isDialogOpen: false,
    deletable: null,
    isSnackOpen: false,
    snackMessage: '',
    isError: false
  })
  const { karangos, isDialogOpen, deletable, isSnackOpen, snackMessage, isError } = state

  function getData(otherState = state) {
    // Usando o axios para acessar a API remota e obter os dados
    axios.get('https://api.faustocintra.com.br/karangos').then(   // Callback para o caso de sucesso
      response => setState({...otherState, karangos: response.data})
    )
  }

  React.useEffect(() => {
    getData()
  }, []) // Vetor de dependências vazio -> useEffect()
         // será executado apenas uma vez, durante o
         // o carregamento (montagem) do componente

  function handleDialogClose(answer) {
    setState({...state, isDialogOpen: false})

    if(answer) {  // Resposta positiva

      // Usa o axios para enviar uma instrução de exclusão
      // à API de back-end
      axios.delete(`https://api.faustocintra.com.br/karangos/${deletable}`)
        .then (
          // Callback se der certo
          // 1) Exibir uma mensagem de feedback positivo para o usuário
          () => {
            const newState = ({
              ...state,
              isSnackOpen: true,  // exibe a snackbar
              snackMessage: 'Item excluído com sucesso',
              isDialogOpen: false,
              isError: false
            })

            // 2) Recarregar os dados da lista
            getData(newState)
          }
          
        )
        .catch (
          // Callback se der errado
          error => {
            // 1) Exibir uma mensagem de feedback de erro para o usuário
            setState({
              ...state,
              isSnackOpen: true,
              snackMessage: 'ERRO: não foi possível excluir. ' + error.message,
              isDialogOpen: false,
              isError: true
            })
          }
        )
    }
  }

  function handleDeleteClick(id) {
    // Abre a caixa de diálogo de confirmação e guarda
    // o id do registro a ser excluído, se a resposta for
    // positiva
    setState({...state, isDialogOpen: true, deletable: id})
  }

  function handleSnackClose(event, reason) {
    // Evita que o snackbar seja fechado clicando-se fora dele 
    if (reason === 'clickaway') return
    
    // Fechamento em condições normais
    setState({...state, isSnackOpen: false})
  }

  return (
    <>
      <h1>Listagem de Carros</h1>

      <ConfirmDialog
        title="ATENÇÃO: operação irreversível"
        open={isDialogOpen}
        onClose={handleDialogClose}
      >
        Deseja realmente excluir este item?
      </ConfirmDialog>

      <Snackbar
        open={isSnackOpen}
        autoHideDuration={6000}
        onClose={handleSnackClose}
        message={snackMessage}
        action={
          <Button color="secondary" size="small" onClick={handleSnackClose}>
            {isError ? 'Que pena!' : 'Entendi'}
          </Button>
        }
      />

      <Toolbar className={classes.toolbar}>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          startIcon={<AddCircleIcon />}
          onClick={() => history.push('/clientes/new')}
        >
          Cadastrar novo carro
        </Button>
      </Toolbar>

      <Paper elevation={4}>
        <DataGrid
          className={classes.dataGrid}
          rows={karangos}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5]}
          autoHeight
          disableSelectionOnClick
        />
      </Paper>      
    </>
  )
}