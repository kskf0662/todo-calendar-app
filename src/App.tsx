import { useEffect, useState } from "react";
import "./App.css";

type Todo = {
  id: number;
  text: string;
  completed: boolean;
  dueDate: string;
};

type Filter = "all" | "active" | "completed";
type ViewMode = "list" | "calendar";

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem("todos");

    if (savedTodos) {
      return JSON.parse(savedTodos);
    }

    return [];
  });

  const [inputText, setInputText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingDueDate, setEditingDueDate] = useState("");

  const today = new Date();
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (inputText.trim() === "") return;
    if (dueDate === "") {
      alert("期限日を入力してください");
      return;
    }

    const newTodo: Todo = {
      id: Date.now(),
      text: inputText.trim(),
      completed: false,
      dueDate: dueDate,
    };

    setTodos([...todos, newTodo]);
    setInputText("");
    setDueDate("");
  };

  const handleAddKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
    setEditingDueDate(todo.dueDate);
  };

  const saveEdit = () => {
    if (editingText.trim() === "") return;
    if (editingDueDate === "") {
      alert("期限日を入力してください");
      return;
    }

    setTodos(
      todos.map((todo) =>
        todo.id === editingId
          ? {
              ...todo,
              text: editingText.trim(),
              dueDate: editingDueDate,
            }
          : todo
      )
    );

    setEditingId(null);
    setEditingText("");
    setEditingDueDate("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
    setEditingDueDate("");
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      saveEdit();
    }

    if (e.key === "Escape") {
      cancelEdit();
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") {
      return !todo.completed;
    }

    if (filter === "completed") {
      return todo.completed;
    }

    return true;
  });

  const activeCount = todos.filter((todo) => !todo.completed).length;

  const movePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarYear(calendarYear - 1);
      setCalendarMonth(11);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const moveNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarYear(calendarYear + 1);
      setCalendarMonth(0);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  const getCalendarDays = () => {
    const firstDay = new Date(calendarYear, calendarMonth, 1);
    const lastDay = new Date(calendarYear, calendarMonth + 1, 0);

    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: (number | null)[] = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const formatDate = (day: number) => {
    const month = String(calendarMonth + 1).padStart(2, "0");
    const date = String(day).padStart(2, "0");

    return `${calendarYear}-${month}-${date}`;
  };

  const getTodosByDate = (date: string) => {
    return todos.filter((todo) => todo.dueDate === date);
  };

  return (
    <div className="app">
      <h1>ToDoアプリ</h1>

      <div className="input-area">
        <input
          type="text"
          value={inputText}
          placeholder="タスクを入力"
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleAddKeyDown}
        />

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <button onClick={addTodo}>追加</button>
      </div>

      <div className="view-area">
        <button
          className={viewMode === "list" ? "active-filter" : ""}
          onClick={() => setViewMode("list")}
        >
          リスト表示
        </button>

        <button
          className={viewMode === "calendar" ? "active-filter" : ""}
          onClick={() => setViewMode("calendar")}
        >
          カレンダー表示
        </button>
      </div>

      <div className="filter-area">
        <button
          className={filter === "all" ? "active-filter" : ""}
          onClick={() => setFilter("all")}
        >
          すべて
        </button>

        <button
          className={filter === "active" ? "active-filter" : ""}
          onClick={() => setFilter("active")}
        >
          未完了
        </button>

        <button
          className={filter === "completed" ? "active-filter" : ""}
          onClick={() => setFilter("completed")}
        >
          完了済み
        </button>
      </div>

      <p className="count-text">残りタスク数：{activeCount}件</p>

      {viewMode === "list" && (
        <ul className="todo-list">
          {filteredTodos.map((todo) => (
            <li key={todo.id} className={todo.completed ? "completed" : ""}>
              {editingId === todo.id ? (
                <div className="edit-area">
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    autoFocus
                  />

                  <input
                    type="date"
                    value={editingDueDate}
                    onChange={(e) => setEditingDueDate(e.target.value)}
                  />

                  <button onClick={saveEdit}>保存</button>
                  <button onClick={cancelEdit}>キャンセル</button>
                </div>
              ) : (
                <>
                  <span onClick={() => toggleTodo(todo.id)}>
                    {todo.text}
                    <small>期限：{todo.dueDate}</small>
                  </span>

                  <div className="button-area">
                    <button onClick={() => startEdit(todo)}>編集</button>
                    <button onClick={() => deleteTodo(todo.id)}>削除</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {viewMode === "calendar" && (
        <div className="calendar-area">
          <div className="calendar-header">
            <button onClick={movePrevMonth}>前月</button>
            <h2>
              {calendarYear}年 {calendarMonth + 1}月
            </h2>
            <button onClick={moveNextMonth}>翌月</button>
          </div>

          <div className="calendar-week">
            <div>日</div>
            <div>月</div>
            <div>火</div>
            <div>水</div>
            <div>木</div>
            <div>金</div>
            <div>土</div>
          </div>

          <div className="calendar-grid">
            {getCalendarDays().map((day, index) => {
              if (day === null) {
                return <div key={index} className="calendar-cell empty"></div>;
              }

              const date = formatDate(day);
              const dayTodos = getTodosByDate(date);

              return (
                <div key={index} className="calendar-cell">
                  <div className="calendar-date">{day}</div>

                  {dayTodos.map((todo) => (
                    <div
                      key={todo.id}
                      className={`calendar-todo ${
                        todo.completed ? "completed" : ""
                      }`}
                      onClick={() => toggleTodo(todo.id)}
                    >
                      {todo.text}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;