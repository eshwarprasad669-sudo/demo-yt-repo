import { useEffect, useState } from 'react';

const API = '/api/todos';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  // Load todos once when the page opens.
  useEffect(() => {
    fetch(API)
      .then((res) => res.json())
      .then(setTodos)
      .catch(() => setError('Could not load todos'));
  }, []);

  async function addTodo(e) {
    e.preventDefault();
    const text = title.trim();
    if (!text) return;
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: text }),
    });
    if (res.ok) {
      const todo = await res.json();
      // Put the new todo at the top, matching the server's order.
      setTodos((prev) => [todo, ...prev]);
      setTitle('');
    } else {
      setError('Could not add todo');
    }
  }

  async function toggleTodo(todo) {
    const res = await fetch(`${API}/${todo._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !todo.completed }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTodos((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    }
  }

  async function deleteTodo(id) {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setTodos((prev) => prev.filter((t) => t._id !== id));
    }
  }

  return (
    <main className="container">
      <h1>Todo App</h1>

      <form onSubmit={addTodo} className="add-form">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
        />
        <button type="submit">Add</button>
      </form>

      {error && <p className="error">{error}</p>}

      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo._id} className={todo.completed ? 'done' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo)}
            />
            <span>{todo.title}</span>
            <button className="delete" onClick={() => deleteTodo(todo._id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {todos.length === 0 && !error && <p className="empty">No todos yet.</p>}
    </main>
  );
}
