import React, { useState, useEffect } from 'react'
import { Input } from './Input'
import { supabase } from '../libs/supabaseClient'
import { useSelector, useDispatch } from 'react-redux'
import '../styles/styles.css'
import { timerAction } from '../store/slice'

export const Timer = ({ token, setIsTimerActive }) => {
  const [disabled, setDisabled] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [value, setValue] = useState(0)
  const [timerValue, setTimerValue] = useState(0)
  const timer = useSelector((state) => state.memory.timer)
  const dispatch = useDispatch()
  const [channel, setChannel] = useState(null)

  const checkTaskActive = async () => {
    try {
      let { data: session } = await supabase
        .from('session')
        .select('*')
        .eq('session_key', token)

      const { data: activeTasks } = await supabase
        .from('tasks')
        .select('id')
        .eq('session_id', session[0]?.id)
        .eq('status', 'active')

      const hasActiveTasks = activeTasks.length > 0
      setIsActive(hasActiveTasks)
    } catch (error) {
      console.error('Error checking task active:', error)
    }
  }

  const handleChange = (event) => {
    const newValue = parseInt(event.target.value)
    setValue(newValue)
  }

  const checkTimer = async () => {
    console.log('Interval')

    // try {
    //   let { data: session } = await supabase
    //     .from('session')
    //     .select()
    //     .eq('session_key', token)

    //   let { data: timerData } = await supabase
    //     .from('timer')
    //     .select()
    //     .eq('session_id', session[0]?.id)

    //   setIsTimerActive(timerData[0]?.status === 'active')

    //   if (timerData[0]?.status === 'active') {
    //     setTimerValue((prevTimerValue) => prevTimerValue - 1)
    //   }
    // } catch (error) {
    //   console.error('Error checking timer:', error)
    // }
  }

  useEffect(() => {
    const channel = supabase
      .channel('any')
      .on('broadcast', { event: 'start-timer' }, (payload) => {
        if (payload.payload.eventName === 'start') {
          setTimerValue(payload.payload.timerValue)
          setDisabled(true)
          setIsTimerActive(true)
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          //   channel.send({
          //     type: 'broadcast',
          //     event: 'cursor-pos',
          //     payload: { x: Math.random(), y: Math.random() },
          //   })
          //   setIsTimerActive(true)
        }
      })

    setChannel(channel)

    return () => {
      channel.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const intervalId = setInterval(() => console.log(), 1000)
    return () => {
      clearInterval(intervalId)
    }
  }, [])

  const disabledButton = () => {
    setTimerValue(value)
    setDisabled(true)
    channel.send({
      type: 'broadcast',
      event: 'start-timer',
      payload: {
        eventName: 'start',
        timerValue: value,
      },
    })
    setIsTimerActive(true)
    // dispatch(timerAction({ token, timerValue: value }))
  }

  let timeout
  useEffect(() => {
    checkTaskActive()
    if (disabled) {
      clearTimeout(timeout)
      if (timerValue <= 0) {
        setTimerValue(0)
      }
      if (timerValue >= 120) {
        setTimerValue(120)
      }
      if (timerValue <= 0) {
        setDisabled(false)
        checkTaskActive()
        setIsTimerActive(false)
        dispatch(timerAction({ token, timerValue: value }))
        channel.send({
          type: 'broadcast',
          event: 'start-timer',
          payload: {
            eventName: 'stop',
          },
        })
      } else {
        timeout = setTimeout(() => setTimerValue(timerValue - 1), 1000)
      }
      return () => {
        clearTimeout(timeout)
      }
    }
  }, [disabled, timeout, timerValue, checkTaskActive])

  return (
    <div>
      <p
        className='user-text'
        style={{ fontSize: '2rem', marginLeft: '5rem', marginBottom: '1rem' }}
      >
        {timerValue}
      </p>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Input value={value} handleChange={handleChange} />
        <button
          className='user-text timer-button'
          onClick={disabledButton}
          disabled={!isActive || disabled || !value}
        >
          Start Voting
        </button>
      </div>
    </div>
  )
}
