import { useEffect, useState } from "react";
import "./App.css";
import "@blueprintjs/core/lib/css/blueprint.css";

export default function App() {
  const [data, setData] = useState([]);
  const [display, setDisplay] = useState(false);
  const [newData, setNewData] = useState({ first: "", last: "", username: "" });
  const [editingId, setEditingId] = useState(null); // Keep track of the user being edited

  // Fetch initial data
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Handle adding or updating a user
  function handleSubmit(e) {
    e.preventDefault();

    if (editingId !== null) {
      // Update existing user
      const updatedUser = {
        idx: editingId,
        name: `${newData.first} ${newData.last}`,
        username: newData.username,
      };

      fetch(`https://jsonplaceholder.typicode.com/users/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(updatedUser),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((updated) => {
          setData(
            data.map((u) =>
              (u.idx ? u.idx : u.id) === editingId ? updated : u
            )
          );
          resetForm();
          console.log("User updated:", updated);
        })
        .catch((error) => console.error("Error updating user:", error));
    } else {
      // Add new user
      const ind =
        data.length > 0
          ? Math.max(...data.map((user) => (user.idx ? user.idx : user.id))) + 1
          : 1;
      console.log(ind);
      const newUser = {
        idx: ind,
        name: `${newData.first} ${newData.last}`,
        username: newData.username,
      };

      fetch("https://jsonplaceholder.typicode.com/users", {
        method: "POST",
        body: JSON.stringify(newUser),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((addedUser) => {
          setData([...data, addedUser]);
          resetForm();
          console.log("User added:", addedUser);
        })
        .catch((error) => console.error("Error adding user:", error));
    }
  }

  // Handle editing a user
  function handleEdit(user) {
    setDisplay(true);
    const [first, last] = user.name.split(" ");
    setNewData({ first, last, username: user.username });
    setEditingId(user.idx ? user.idx : user.id); // Set the user ID being edited
  }

  // Handle deleting a user
  function handleDelete(id) {
    fetch(`https://jsonplaceholder.typicode.com/users/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setData(
          data.filter((user) => (user.idx ? user.idx !== id : user.id !== id))
        );
        console.log(`User with id ${id} deleted`);
      })
      .catch((error) => console.error("Error deleting user:", error));
  }

  // Reset form fields and editing state
  function resetForm() {
    setNewData({ first: "", last: "", username: "" });
    setEditingId(null);
  }

  return (
    <div className="container">
      <h1>User Management</h1>
      <button
        className="btn-big"
        onClick={() => {
          setDisplay(true);
        }}
      >
        Add+
      </button>
      <form
        onSubmit={handleSubmit}
        className={display ? "form" : "form hidden"}
      >
        <input
          type="text"
          placeholder="First Name"
          value={newData.first}
          onChange={(e) => setNewData({ ...newData, first: e.target.value })}
          required
          className="inp"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={newData.last}
          onChange={(e) => setNewData({ ...newData, last: e.target.value })}
          required
          className="inp"
        />
        <input
          type="text"
          placeholder="Username"
          value={newData.username}
          onChange={(e) => setNewData({ ...newData, username: e.target.value })}
          required
          className="inp"
        />
        <button
          type="submit "
          className="btn"
          onClick={() => {
            setDisplay(false);
          }}
        >
          {editingId !== null ? "Update User" : "Add User"}
        </button>
      </form>
      <div className={display ? "overlay" : ""}></div>
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>First</th>
            <th>Last</th>
            <th>Username</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user) => {
            const [first, last] = user.name.split(" ");
            return (
              <tr key={user.idx ? user.idx : user.id}>
                <td>{user.idx ? user.idx : user.id}</td>
                <td>{first}</td>
                <td>{last}</td>
                <td>{user.username}</td>
                <td>
                  <button
                    onClick={() => handleEdit(user)}
                    className="btn-small"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user.idx ? user.idx : user.id)}
                    className="btn-small"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
