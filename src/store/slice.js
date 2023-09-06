import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../libs/supabaseClient'

export const addUserKey = createAsyncThunk(
  'memory/addUserKey',
  async ({ userId, user }) => {
    const { data: existingUser, error: existingUserError } = await supabase
      .from('user_auth')
      .select()
      .eq('user_key', userId)

    if (existingUser && existingUser.length > 0) {
      return null
    }

    const { data: adminUser, error: adminUserError } = await supabase
      .from('user_auth')
      .select('*')
      .eq('admin', true)
    if (adminUser && adminUser.length > 0) {
      const { data: notAdmin } = await supabase
        .from('user_auth')
        .insert([
          {
            user_key: userId,
            admin: false,
            username: user?.firstName,
            email: user?.primaryEmailAddress?.emailAddress,
            image: user?.imageUrl,
          },
        ])
        .select()
    } else {
      const { data, error } = await supabase
        .from('user_auth')
        .insert([
          {
            user_key: userId,
            admin: true,
            username: user?.firstName,
            email: user?.primaryEmailAddress?.emailAddress,
            image: user?.imageUrl,
          },
        ])
        .select()
      const { data: workData } = await supabase
        .from('workspace')
        .insert([{ admin_id: data[0].id }])
        .select()
    }

    const { data, error: insertError } = await supabase
      .from('user_auth')
      .select()
      .eq('user_key', userId)

    return data
  }
)

export const addUserLogin = createAsyncThunk(
  'memory/addUserLogin',
  async (login) => {
    const { data, error } = await supabase
      .from('user_auth')
      .insert([{ user_key: login, admin: false }])
      .select()
    return data
  }
)

export const addSessionKey = createAsyncThunk(
  'memory/addSessionKey',
  async ({ token, workspace, userId }) => {
    const { data: sessionData } = await supabase
      .from('session')
      .select()
      .eq('workspace_id', workspace)
    console.log(sessionData, 'sessionDATA')
    if (sessionData && sessionData.length > 0) {
      await supabase
        .from('user_auth')
        .update({ session_id: sessionData?.[0]?.id })
        .eq('user_key', userId)
        .select()
    } else {
      const { data, error } = await supabase
        .from('session')
        .insert([{ session_key: token, workspace_id: workspace }])
        .select()
      console.log(data?.[0]?.id)

      await supabase
        .from('user_auth')
        .update({ session_id: data?.[0]?.id })
        .eq('user_key', userId)
        .select()
    }
  }
)

export const fetchCards = createAsyncThunk('memory/fetchCards', async () => {
  let { data: cards, error } = await supabase.from('cards').select()
  return cards
})

export const addTask = createAsyncThunk(
  'momory/addTask',
  async ({ taskName, description, session }) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          name: taskName,
          description: description,
          session_id: session,
          status: 'waiting',
        },
      ])
      .select()
  }
)

export const timerAction = createAsyncThunk(
  'memory/timerAction',
  async ({ token, timerValue }) => {
    let { data: session } = await supabase
      .from('session')
      .select('id')
      .eq('session_key', token)

    const { data } = await supabase
      .from('timer')
      .select()
      .eq('session_id', session[0]?.id)
    if (!data[0]?.status) {
      let { data: session } = await supabase
        .from('session')
        .select('id')
        .eq('session_key', token)

      const { data, error } = await supabase
        .from('timer')
        .insert([
          { status: 'active', session_id: session[0]?.id, value: timerValue },
        ])
        .select()
      return data
    } else {
      if (data[0]?.status === 'active') {
        let { data: session } = await supabase
          .from('session')
          .select('id')
          .eq('session_key', token)

        const { data, error } = await supabase
          .from('timer')
          .update({ status: 'disabled', value: timerValue })
          .eq('session_id', session[0]?.id)
          .select()
        return data
      } else {
        let { data: session } = await supabase
          .from('session')
          .select('id')
          .eq('session_key', token)

        const { data, error } = await supabase
          .from('timer')
          .update({ status: 'active', value: timerValue })
          .eq('session_id', session[0]?.id)
          .select()
        return data
      }
    }
  }
)

export const fetchVote = createAsyncThunk(
  'memory/fetchVote',
  async ({ token, taskId }) => {
    console.log(taskId)
    let { data: session } = await supabase
      .from('session')
      .select('id,tasks(*, votes(*))')
      .eq('session_key', token)
    console.log(session[0]?.id)
    let { data: tasks } = await supabase
      .from('tasks')
      .select('*, votes (*) ')
      .eq('session_id', session[0]?.id)

    let { data: taskVotes, error } = await supabase
      .from('votes')
      .select('id,user_id,card_id,cards(value),user_auth(*),tasks(*)')
      .eq('task_id', taskId)

    return taskVotes
  }
)

export const addVote = createAsyncThunk(
  'memory/addVote',
  async ({ tasks, user_id, card_id }) => {
    const { data: dataVote } = await supabase
      .from('votes')
      .insert([{ task_id: tasks, user_id: user_id, card_id: card_id }])
      .select()
    console.log(dataVote[0])
    return dataVote[0]
  }
)

export const memorySlice = createSlice({
  name: 'memory',
  initialState: {
    session: [],
    userKey: [],
    cards: [],
    task: {},
    vote: [],
    timer: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(addSessionKey.fulfilled, (state, action) => {
      state.session = action.payload
    })
    builder.addCase(addUserKey.fulfilled, (state, action) => {
      state.userKey = action.payload
    })
    builder.addCase(addUserLogin.fulfilled, (state, action) => {
      state.userKey = [...action.payload]
    })
    builder.addCase(fetchCards.fulfilled, (state, action) => {
      state.cards = [...action.payload]
    })
    builder.addCase(addTask.fulfilled, (state, action) => {
      state.task = [{ ...action.payload }]
    })
    builder.addCase(addVote.fulfilled, (state, action) => {
      state.vote = [{ ...action.payload }]
    })
    builder.addCase(fetchVote.fulfilled, (state, action) => {
      state.vote = action.payload
    })
    builder.addCase(fetchVote.rejected, (state, action) => {
      state.vote = []
    })
    builder.addCase(timerAction.fulfilled, (state, action) => {
      state.timer = action.payload
    })
  },
})
