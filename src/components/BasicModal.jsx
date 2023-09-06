import * as React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import { AiOutlineShareAlt } from 'react-icons/ai'
import { CopyButton } from './CopyButton'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 413,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
}

export const BasicModal = ({ token }) => {
  const [open, setOpen] = React.useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const text = `http://localhost:5173/workspace/${token}`
  return (
    <div>
      <Button variant='outlined' size='small' onClick={handleOpen}>
        Share
        <AiOutlineShareAlt style={{ marginLeft: '0.3rem' }} />
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box sx={style}>
          <Typography id='modal-modal-title' variant='h6' component='h2'>
            Send this link to your mates:
          </Typography>
          <Typography id='modal-modal-description' sx={{ mt: 2 }}>
            {text} <CopyButton text={text} />
          </Typography>
        </Box>
      </Modal>
    </div>
  )
}
