import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


import './App.css'


type Todo = {
  id: number,
  title: string,
  time: number
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([])

  useEffect(() => {
    async function getTodos() {
      const { data, error } = await supabase.from('study-record').select()
      if (error) {
        console.error(error)
        return
      }
      setTodos(data)
      console.log(data)

    }

    getTodos()
  }, [])

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))
      }
    </ul >
  )
}