import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addSessionKey } from '../store/slice'
import { CustomSelect } from './CustomSelect'
import '../styles/styles.css'
import { supabase } from '../libs/supabaseClient'
import { useAuth } from '@clerk/clerk-react'

export const Workspace = () => {
  const session = useSelector((state) => state.memory.session)
  const { userId } = useAuth()

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const generateKey = (length) => {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let key = ''
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length)
      key += characters[randomIndex]
    }
    return key
  }

  const handleSubmit = async () => {
    let { data: workspace } = await supabase.from('workspace').select('id')
    console.log(workspace[0]?.id)
    const token = generateKey(10)
    dispatch(addSessionKey({ token, workspace: workspace[0]?.id, userId }))
    navigate(`/workspace/${token}`)
  }

  return (
    <div>
      <button onClick={() => navigate('/')} className='button-outline'>
        Go Back
      </button>
      <div style={{ marginLeft: '-2rem' }}>
        <p className='text-1'>Choose mode</p>
        <div className='select'>
          <CustomSelect />
          <button
            className='button-1'
            style={{ marginLeft: '1rem' }}
            onClick={handleSubmit}
            type='button'
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}
