import { useEffect, useState } from "react";
import "./App.css";

// The API runs on the Express backend, not the Vite frontend.
const API = import.meta.env.VITE_API_URL;

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  // Avoid "Unexpected end of JSON input" when the server returns an HTML 404.
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : { message: `Server returned HTTP ${response.status}. Check the API URL and backend terminal.` };

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [register, setRegister] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadTasks() {
    const savedTasks = await request("/tasks");
    setTasks(savedTasks);
  }

  useEffect(() => {
    request("/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setCheckingSession(false));
  }, []);

  useEffect(() => {
    if (user) {
      loadTasks().catch((e) => setError(e.message));
    } else {
      setTasks([]);
    }
  }, [user]);

  async function submitAuth(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const result = await request(register ? "/register" : "/login", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      setUser(result);
      setPassword("");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function addTask(e) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setError("");
    try {
      const task = await request("/tasks", {
        method: "POST",
        body: JSON.stringify({ title: trimmedTitle }),
      });
      setTasks((current) => [task, ...current]);
      setTitle("");
    } catch (e) {
      setError(e.message);
    }
  }

  async function toggleTask(task) {
    setError("");
    try {
      const updated = await request(`/tasks/${task._id}`, {
        method: "PATCH",
        body: JSON.stringify({ completed: !task.completed }),
      });
      setTasks((current) =>
        current.map((item) => item._id === updated._id ? updated : item)
      );
    } catch (e) {
      setError(e.message);
    }
  }

  async function deleteTask(id) {
    setError("");
    try {
      await request(`/tasks/${id}`, { method: "DELETE" });
      setTasks((current) => current.filter((task) => task._id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  async function logout() {
    setError("");
    try {
      await request("/logout", { method: "POST" });
      setUser(null);
    } catch (e) {
      setError(e.message);
    }
  }

  if (checkingSession) {
    return <main className="auth"><h1>TaskFlow</h1><p>Checking your session…</p></main>;
  }

  if (!user) {
    return (
      <main className="auth">
        <h1>TaskFlow</h1>
        <p>Your day, organized.</p>

        <form onSubmit={submitAuth}>
          {register && (
            <input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <input
            type="password"
            placeholder="Password (8+ characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={register ? "new-password" : "current-password"}
            minLength={8}
            required
          />
          <button disabled={busy}>{busy ? "Please wait…" : register ? "Create account" : "Log in"}</button>
        </form>

        {error && <p className="error" role="alert">{error}</p>}

        <button className="link" type="button" onClick={() => {
          setRegister((value) => !value);
          setError("");
        }}>
          {register ? "Already registered? Log in" : "New here? Create an account"}
        </button>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <header>
        <div>
          <h1>TaskFlow</h1>
          <p>Hello, {user.name || user.email} 👋</p>
        </div>
        <button className="secondary" onClick={logout}>Log out</button>
      </header>

      <h2>My tasks</h2>
      <form className="add-form" onSubmit={addTask}>
        <input
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
        />
        <button>Add task</button>
      </form>

      {error && <p className="error" role="alert">{error}</p>}
      {tasks.length === 0 && <p>No tasks yet. Add your first one!</p>}

      {tasks.map((task) => (
        <div className="task" key={task._id}>
          <label>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task)}
            />
            <span className={task.completed ? "done" : ""}>{task.title}</span>
          </label>
          <button className="delete" onClick={() => deleteTask(task._id)}>Delete</button>
        </div>
      ))}
    </main>
  );
}
