import React, { useState, useEffect } from 'react'
import { styled, alpha } from '@mui/material/styles'
import Button from '@mui/material/Button'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import { supabase } from '../libs/supabaseClient'
import '../styles/styles.css'
import Radio from '@mui/material/Radio'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import { useSelector, useDispatch } from 'react-redux'
import { fetchVote } from '../store/slice'

const StyledTabs = styled((props) => (
  <Tabs
    {...props}
    TabIndicatorProps={{ children: <span className='MuiTabs-indicatorSpan' /> }}
  />
))(({ theme }) => ({
  '& .MuiTabs-indicator': {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    '& > .MuiTabs-indicatorSpan': {
      maxWidth: 40,
      width: '100%',
      backgroundColor: theme.palette.secondary.main,
    },
  },
}))

export default function TaskHistoryButton({
  token,
  isTimerActive,
  setIsTimerActive,
}) {
  const [open, setOpen] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [tasks, setTasks] = useState([])
  const [disabled, setDisabled] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const vote = useSelector((state) => state.memory.vote)
  const dispatch = useDispatch()

  useEffect(() => {
    console.log(selectedTask, 'selectedTask')
    dispatch(fetchVote({ token, taskId: selectedTask }))
  }, [dispatch, selectedTask])

  const handleDeleteTask = async (taskId) => {
    await supabase.from('tasks').delete().eq('id', taskId)
    await checkTask(token)
    await dispatch(fetchVote({ token, taskId }))
  }

  const updateTaskStatuses = async (activeTaskId, newActiveTaskId) => {
    if (activeTaskId) {
      await supabase
        .from('tasks')
        .update({ status: 'waiting' })
        .eq('id', activeTaskId)
    }
    if (newActiveTaskId) {
      await supabase
        .from('tasks')
        .update({ status: 'active' })
        .eq('id', newActiveTaskId)
    }
  }

  const checkTask = async (token) => {
    let { data: session } = await supabase
      .from('session')
      .select('id')
      .eq('session_key', token)
    let { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('session_id', session[0]?.id)
    setTasks(tasks)
    return tasks
  }

  const handleOpen = async () => {
    await checkTask(token)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const handleSelect = async (selectedTaskId) => {
    if (selectedTaskId) {
      const activeTaskId = tasks.find((task) => task.status === 'active')?.id
      await updateTaskStatuses(activeTaskId, selectedTaskId)
    }
    setOpen(false)
  }

  useEffect(() => {
    setDisabled(isTimerActive)
  }, [isTimerActive])

  const disabledButton = () => {
    if (isTimerActive) {
      setDisabled(true)
    } else {
      handleOpen()
      setDisabled(false)
    }
  }

  return (
    <div>
      <Button variant='contained' onClick={disabledButton} disabled={disabled}>
        Show Tasks
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby='task-history-dialog-title'
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle id='task-history-dialog-title'>Task History</DialogTitle>
        <DialogContent>
          <StyledTabs value={tabValue} onChange={handleTabChange}>
            <Tab label='Tasks' />
            <Tab label='History' />
          </StyledTabs>
          {tabValue === 0 && (
            <DialogContentText>
              {tasks?.map((task, index) => (
                <div
                  key={index}
                  style={{
                    height: '5rem',
                    backgroundColor:
                      selectedTask === task?.id
                        ? 'lightblue'
                        : 'rgb(220, 220, 220)',
                    marginBottom: '1rem',
                    borderRadius: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'start',
                  }}
                >
                  <Radio
                    checked={selectedTask === task?.id}
                    onChange={() => setSelectedTask(task?.id)}
                    value={task?.id}
                  />
                  <div>
                    <p className='user-text' style={{ fontSize: '1.4rem' }}>
                      {task?.name}
                    </p>
                    <p className='user-text'>{task?.description}</p>
                    <p className='user-text'>{task?.status}</p>
                  </div>
                  <div>
                    <IconButton
                      style={{
                        position: 'absolute',
                        right: '2rem',
                      }}
                      aria-label='delete'
                      onClick={() => handleDeleteTask(task?.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </div>
              ))}
            </DialogContentText>
          )}
          {tabValue === 1 && (
            <DialogContentText>
              <div
                style={{
                  minHeight: '0rem',
                  backgroundColor: 'rgb(220, 220, 220)',
                  marginBottom: '1rem',
                  borderRadius: '5px',
                }}
              >
                <p className='user-text' style={{ fontSize: '1.4rem' }}>
                  {vote?.[0]?.tasks?.name}
                </p>
                {vote?.map((voteItem, voteIndex) => (
                  <div key={voteIndex}>
                    {voteItem?.user_auth && (
                      <img
                        style={{
                          width: '1rem',
                          height: '1rem',
                          borderRadius: '100%',
                          marginRight: '0.3rem',
                        }}
                        src={voteItem?.user_auth?.image}
                        alt=''
                      />
                    )}
                    {voteItem?.user_auth?.username} : {voteItem?.cards?.value}
                  </div>
                ))}
              </div>
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleSelect(selectedTask)} color='primary'>
            Select
          </Button>
          <Button onClick={handleClose} color='primary'>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
