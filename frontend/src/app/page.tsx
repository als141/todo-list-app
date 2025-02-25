"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';

interface TodoItem {
  id: number;
  task: string;
  completed: boolean;
}

export default function Home() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [task, setTask] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const response = await axios.get('http://127.0.0.1:8000/todos');
    setTodos(response.data);
  };

  const addTodo = async () => {
    const newTodo = { id: todos.length + 1, task, completed: false };
    await axios.post('http://127.0.0.1:8000/todos', newTodo);
    setTodos([...todos, newTodo]);
    setTask('');
  };

  const deleteTodo = async (id: number) => {
    await axios.delete(`http://127.0.0.1:8000/todos/${id}`);
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">TODOリスト</h1>
      <input
        type="text"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        className="border p-2"
        placeholder="新しいタスクを追加"
      />
      <button onClick={addTodo} className="bg-blue-500 text-white p-2 ml-2">
        追加
      </button>
      <ul className="mt-4">
        {todos.map((todo) => (
          <li key={todo.id} className="flex justify-between">
            <span>{todo.task}</span>
            <button className="text-red-500" onClick={() => deleteTodo(todo.id)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
