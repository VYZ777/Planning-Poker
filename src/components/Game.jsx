import { useState, useEffect } from 'react'
import { Input } from './Input'
import { supabase } from '../libs/supabaseClient'
import { useSelector, useDispatch } from 'react-redux'
import {
  addVote,
  fetchCards,
  addUserKey,
  addSessionKey,
  fetchVote,
} from '../store/slice'
import { useAuth, useUser, useClerk } from '@clerk/clerk-react'
import { useNavigate, useParams } from 'react-router-dom'
import TaskButton from './TaskButton'
import TaskHistoryButton from './TaskHistoryButton'
import '../styles/styles.css'
import { Timer } from './Timer'

export const Game = () => {
  const [users, setUsers] = useState([])
  const [counter, setCounter] = useState(0)
  const { token } = useParams()
  const { userId } = useAuth()
  const { isSignedIn } = useUser()
  const { user } = useClerk()
  const cards = useSelector((state) => state.memory.cards)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [choosen, setChoosen] = useState(false)

  const fetchUsers = async () => {
    const { data: usersData, error } = await supabase
      .from('user_auth')
      .select('*')
    setUsers(usersData)
  }

  const checkUser = async () => {
    let { data: workspace } = await supabase.from('workspace').select('id')
    let { data: user_auth, error } = await supabase
      .from('user_auth')
      .select('user_key')
      .eq('user_key', userId)
    if (isSignedIn) {
      dispatch(fetchCards())
      if (user_auth?.length === 0) {
        console.log({
          token,
          workspace,
        })
        await dispatch(addUserKey({ userId, user })).unwrap()
        dispatch(addSessionKey({ userId, workspace: workspace[0]?.id, token }))
      }
    } else {
      navigate('/sign-in')
    }
  }

  const checkVote = async () => {
    try {
      let { data: session } = await supabase
        .from('session')
        .select()
        .eq('session_key', token)

      let { data: tasks } = await supabase
        .from('tasks')
        .select()
        .eq('session_id', session[0]?.id)
        .eq('status', 'active')

      let { data: user_auth } = await supabase
        .from('user_auth')
        .select()
        .eq('user_key', userId)

      let { data: taskVotes } = await supabase
        .from('votes')
        .select()
        .eq('task_id', tasks?.[0].id)
        .eq('user_id', user_auth?.[0]?.id)
      if (taskVotes.length) {
        setChoosen(true)
      } else {
        setChoosen(false)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    console.log(cards)
    if (isTimerActive) {
      checkVote()
    }
  }, [isTimerActive])

  const handleChoose = async (cardId) => {
    console.log(cardId)
    if (isTimerActive) {
      let { data: user_auth } = await supabase
        .from('user_auth')
        .select('id')
        .eq('user_key', userId)
      let { data: session, error } = await supabase
        .from('session')
        .select('id')
        .eq('session_key', token)
      let { data: tasks } = await supabase
        .from('tasks')
        .select('id')
        .eq('session_id', session[0]?.id)
        .eq('status', 'active')

      let { data: votes } = await supabase
        .from('votes')
        .select('*')
        .eq('user_id', user_auth[0]?.id)
        .eq('task_id', tasks[0]?.id)
      dispatch(
        addVote({
          tasks: tasks[0]?.id,
          user_id: user_auth[0]?.id,
          card_id: cardId,
        })
      )
      dispatch(fetchVote(token))
      setDisabled(true)
    }
  }

  useEffect(() => {
    setTimeout(async () => {
      let { data: session, error } = await supabase
        .from('session')
        .select('session_key')
        .eq('session_key', token)
      if (session.length === 0) {
        navigate('/not-found')
      } else {
        const fetchAndCheckUser = async () => {
          await checkUser().catch(console.error)
          fetchUsers()
        }
        fetchAndCheckUser()
      }
    }, 1000)
  }, [])

  return (
    <div>
      <div>
        <div style={{ margin: '0.2rem', position: 'absolute' }}>
          <TaskButton token={token} />
        </div>
        <div style={{ marginTop: '3rem', position: 'absolute' }}>
          <TaskHistoryButton
            isTimerActive={isTimerActive}
            setIsTimerActive={setIsTimerActive}
            token={token}
          />
        </div>
      </div>

      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', marginTop: '15rem' }}>
          <Timer token={token} setIsTimerActive={setIsTimerActive} />
        </div>
        <div className='table'>
          <div className='users'>
            {users.map((userData, index) => (
              <div key={index}>
                <img
                  style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '100%',
                  }}
                  src={userData?.image}
                  alt=''
                />
                <div className='user-text'>{userData?.username}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'end',
          width: '100%',
          height: '10rem',
        }}
      >
        {cards?.map((card, idCard) => {
          return (
            <button
              className={
                choosen || !isTimerActive || disabled ? 'not-active' : 'cards'
              }
              onClick={() => handleChoose(card?.id)}
              key={idCard}
              disabled={choosen || !isTimerActive || disabled}
            >
              {card?.value}
            </button>
          )
        })}
      </div>
    </div>
  )
}
