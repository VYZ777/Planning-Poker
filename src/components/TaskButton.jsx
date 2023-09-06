import React, { useState } from 'react'
import { styled, alpha } from '@mui/material/styles'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Modal from '@mui/material/Modal'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import EditIcon from '@mui/icons-material/Edit'
import Divider from '@mui/material/Divider'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import HistoryToggleOffOutlinedIcon from '@mui/icons-material/HistoryToggleOffOutlined'
import { useDispatch, useSelector } from 'react-redux'
import { addTask } from '../store/slice'
import { supabase } from '../libs/supabaseClient'

const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color:
      theme.palette.mode === 'light'
        ? 'rgb(55, 65, 81)'
        : theme.palette.grey[300],
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity
        ),
      },
    },
  },
}))

export default function TaskButton({ token }) {
  const text = `http://localhost:5173/workspace/${token}`
  const dispatch = useDispatch()
  const task = useSelector((state) => state.memory.task)
  const [anchorEl, setAnchorEl] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [taskName, setTaskName] = useState('')
  const [description, setDescription] = useState('')
  const [disabled, setDisabled] = useState(false)
  const [isTaskHistoryOpen, setIsTaskHistoryOpen] = useState(false)

  const open = Boolean(anchorEl)

  const handleOpenTaskHistory = () => {
    setIsTaskHistoryOpen(true)
    handleClose()
  }

  const handleCloseTaskHistory = () => {
    setIsTaskHistoryOpen(false)
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleCopy = async () => {
    setAnchorEl(null)
    await navigator.clipboard.writeText(text)
  }

  const handleOpenModal = () => {
    setIsModalOpen(true)
    handleClose()
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTaskName('')
    setDescription('')
  }

  const handleSaveTask = async () => {
    let { data: session, error } = await supabase
      .from('session')
      .select('id')
      .eq('session_key', token)
    handleCloseModal()
    dispatch(addTask({ taskName, description, session: session[0]?.id }))
  }

  const isSubmitDisabled = !taskName || !description

  return (
    <div>
      <Button
        id='demo-customized-button'
        aria-controls={open ? 'demo-customized-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        variant='contained'
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
      >
        Options
      </Button>
      <StyledMenu
        id='demo-customized-menu'
        MenuListProps={{
          'aria-labelledby': 'demo-customized-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={handleOpenModal} disableRipple>
          <EditIcon />
          Create Task
        </MenuItem>
        <MenuItem onClick={handleCopy} disableRipple>
          <FileCopyIcon />
          Copy Link
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />

        <MenuItem onClick={handleClose} disableRipple>
          <MoreHorizIcon />
          More
        </MenuItem>
      </StyledMenu>
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby='modal-title'
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <TextField
            label='Task Name'
            fullWidth
            variant='outlined'
            margin='normal'
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
          <TextField
            label='Description'
            fullWidth
            variant='outlined'
            margin='normal'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button
            variant='contained'
            onClick={handleSaveTask}
            disabled={isSubmitDisabled}
          >
            Save Task
          </Button>
        </Box>
      </Modal>
    </div>
  )
}
