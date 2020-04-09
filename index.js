const express = require('express');
const morgan = require('morgan');

const app = express();

app.use(express.json());

morgan.token('body', (request) => JSON.stringify(request.body));

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body', {
        skip: (request) => request.method !== 'POST'
    }
));

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method);
    console.log('Path:  ', request.path);
    console.log('Body:  ', request.body);
    console.log('---');
    next();
}

app.use(requestLogger);

let persons = [
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    },
    {
        "name": "Bab Mank",
        "number": "(456) 789-5464",
        "id": 5
    },
    {
        "name": "Bob Mank",
        "number": "(678) 654-9876",
        "id": 6
    }
];

app.get('/info', (request, response) => {
    response.send(`
        <div>Phonebook has info for ${persons.length} people</div>
        <br>
        <div>${new Date()}</div>`);
});

app.get('/api/persons', (request, response) => {
    response.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const person = persons.find(person => person.id === id);
    if (person) {
        response.json(person);
    } else {
        response.status(404).end();
    }
});

const generateId = () => {
    const maxId = persons.length > 0
        ? Math.max(...persons.map(pers => pers.id))
        : 0;
    return maxId + 1;
}

app.post('/api/persons', (request, response) => {
    const body = request.body;

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'content missing'
        });
    }

    const match = persons.find(person => person.name === body.name);
    if (match) {
        return response.status(400).json({
            error: 'name already exists'
        });
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId()
    }

    persons = persons.concat(person);

    response.json(person);
});

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    persons = persons.filter(person => person.id !== id);

    response.status(204).end();
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' });
}

app.use(unknownEndpoint);

const port = 3001;
app.listen(port);
console.log(`Server running on port ${port}`);
