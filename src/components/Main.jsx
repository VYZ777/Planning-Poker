import React, { useRef, useEffect, useState } from 'react'
import { useAuth, useUser, useClerk } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import '../styles/styles.css'
import { CustomModal } from './CustomModal'
import { supabase } from '../libs/supabaseClient'
import { addUserKey } from '../store/slice'

export const Main = () => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const { userId } = useAuth()
  const { user } = useClerk()
  const userKey = useSelector((state) => state.memory.userKey)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isSignedIn } = useUser()

  const handleOpen = () => {
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleNavigate = async () => {
    let { data: user_auth, error } = await supabase
      .from('user_auth')
      .select('user_key')
      .eq('user_key', userId)
    if (isSignedIn) {
      navigate('/workspace')
      if (user_auth && user_auth.length > 0) {
        null
      } else {
        dispatch(addUserKey({ userId, user }))
      }
    } else {
      navigate('/sign-in')
    }
  }

  useEffect(() => {
    const container = containerRef.current
    const elementsWithDepth = container.querySelectorAll('[data-depth]')

    window.addEventListener('mousemove', (event) => {
      const mouseX = event.clientX
      const mouseY = event.clientY
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      const moveX = (mouseX - centerX) * 0.01
      const moveY = (mouseY - centerY) * 0.01

      elementsWithDepth.forEach((element) => {
        const depthFactor = element.dataset.depth || 1

        const elementRect = element.getBoundingClientRect()
        const elementSize = Math.max(elementRect.width, elementRect.height)

        element.style.transform = `translate(${moveX * depthFactor}px, ${
          moveY * depthFactor
        }px) rotate(${moveX * depthFactor}deg)`
      })
    })
  }, [])

  return (
    <div ref={containerRef} className='container'>
      <div className='circle-4'></div>
      <div className='circle-1' data-depth='0.7'></div>
      <div className='circle-2' data-depth='0.9'></div>
      <div className='circle-3' data-depth='0.6'></div>
      <div className='circle-5' data-depth='1'></div>
      <div className='circle-6' data-depth='1.5'></div>
      <div className='circle-7' data-depth='2'></div>
      <div data-depth='0'>
        <div className='greeting-container' data-depth='0'>
          <h1 className='greeting'>Welcome to</h1>
          <h1 className='greeting-1' data-depth='0.01'>
            Planning Poker
          </h1>
        </div>
        <button className='button' onClick={handleNavigate}>
          Create Workspace
        </button>
        <button className='button-1' onClick={handleOpen}>
          Join Game
        </button>
        <CustomModal open={isOpen} onClose={handleClose} />
        {isSignedIn ? <div></div> : null}
      </div>
      <div></div>
    </div>
  )
}
