import React, { useState } from 'react'
import Modal from '@mui/material/Modal'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import { supabase } from '../libs/supabaseClient'
import { addUserLogin } from '../store/slice'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { AiOutlineArrowRight } from 'react-icons/ai'

export const CustomModal = ({ open, onClose }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [data, setData] = useState({
    input1: '',
    input2: '',
  })

  const handleChange = (event) => {
    setData({
      ...data,
      [event.target.name]: event.target.value,
    })
  }

  const handleSubmit = async () => {
    const { data: session, error } = await supabase
      .from('session')
      .select('session_key')
      .eq('session_key', data.input2)

    if (session && session.length > 0) {
      navigate(`/workspace/${data.input2}`)
      dispatch(addUserLogin(data.input1))
    } else {
      navigate('/not-found')
    }

    onClose()
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 2,
          p: 4,
        }}
      >
        <IconButton
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
          }}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
        <TextField
          label='Type your Nickname'
          name='input1'
          value={data.input1}
          onChange={handleChange}
          fullWidth
          variant='outlined'
          margin='normal'
        />
        <TextField
          label='Type Session ID'
          name='input2'
          value={data.input2}
          onChange={handleChange}
          fullWidth
          variant='outlined'
          margin='normal'
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
          }}
        >
          <Button variant='contained' onClick={handleSubmit}>
            Submit
          </Button>
          <Link style={{ textDecoration: 'none' }} to={'/workspace'}>
            <p style={{ color: 'GrayText' }}>
              Or create a Workspace{' '}
              <AiOutlineArrowRight style={{ marginBottom: '-0.2rem' }} />{' '}
            </p>
          </Link>
        </div>
      </Box>
    </Modal>
  )
}
