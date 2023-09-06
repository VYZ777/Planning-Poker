import { useEffect, useState } from 'react'
import { supabase } from '../libs/supabaseClient'

export const Result = ({ token }) => {
  // Состояния для хранения данных пользователя и карты
  const [userAuthData, setUserAuthData] = useState(null)
  const [cardsData, setCardsData] = useState(null)

  const fetchResult = async () => {
    let { data: session } = await supabase
      .from('session')
      .select('id')
      .eq('session_key', token)

    let { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('session_id', session[0]?.id)

    if (tasks[0]?.status === 'active') {
      let { data: votes, error } = await supabase
        .from('votes')
        .select('id,user_id,card_id,cards(value),user_auth(*),tasks(name)')
        .eq('task_id', tasks[0]?.id)
      // Обновляем состояния данными о пользователе и карте
      setUserAuthData(votes.map((vote) => vote?.user_auth))
      setCardsData(votes.map((vote) => vote?.cards))
    } else {
      // Если задача неактивна, устанавливаем состояния в null
      setUserAuthData(null)
      setCardsData(null)
    }
  }

  useEffect(() => {
    fetchResult()
  }, [])

  return (
    <div>
      {userAuthData &&
        userAuthData.map((user, i) => (
          <div key={i}>
            <img
              style={{ width: '1rem', height: '1rem', borderRadius: '100%' }}
              src={user?.image}
              alt=''
            />
            {user?.username} : {cardsData && cardsData[0]?.value}
          </div>
        ))}
    </div>
  )
}
