const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const res = require('express/lib/response');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

// Middleware
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  // Percorrendo Array de usuários e armazenando o usuário em uma const
  const user = users.find((user) => {
    return user.username === username;
  });

  // Se o username não for encontrado
  if (!user) {
    return response.status(404).json({ error: "Usuário não encontrado" });
  }

  // Valor que pode ser exportado para fora do middleware
  request.user = user;

  return next();
}

// Cadastro do usuário
app.post("/users", (request, response) => {
  const { name, username } = request.body;

  // Varrendo array e verificando se contem username repetido
  // some => retorna verdadeiro ou falso dependendo da condiçao passada para ele
  const usernameAlreadyExist = users.some((user) => {
    return user.username === username;
  });

  // Retornando erro caso o username já esteja cadastrado
  if (usernameAlreadyExist) {
    return response
      .status(400)
      .json({ error: "esse username já está em uso!" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});



app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;


  return response.status(201).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { title, deadline } = request.body;

  const { id } = request.params;

  const todo = user.todos.find((todo) => {
    return todo.id === id;
  });

  if (!todo) {
    return response.status(404).json({ error: "Todo não encontrado" });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;

  const todo = user.todos.find((todo) => {
    return todo.id === id;
  });

  if (!todo) {
    return response.status(404).json({ error: "Todo não encontrado" });
  }

  todo.done = true;

  return response.json(todo);
});


app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  console.log(request.user)
  const { user } = request;

  const { id } = request.params;

  
  const todoIndex = user.todos.findIndex((todo) => {
    return todo.id === id;
  });


  if (todoIndex === -1) {
    return response.status(404).json({ error: "Todo não encontrado" });
  }

  
  user.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;