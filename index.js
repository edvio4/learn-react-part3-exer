require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('build'));

morgan.token('body', (request) => JSON.stringify(request.body));

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body', {
        skip: (request) => request.method !== 'POST'
    }
));

const errorHandling = (error, request, response, next) => {
    console.log(JSON.stringify(error))
    if (error.name === "ValidationError") {
        return response.status(400).json({ error: error.errors.name.message });
    } else if (error.code === 11000) {
        return response.status(400).json({ error: error.errmsg });
    }

    next(error);
}

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method);
    console.log('Path:  ', request.path);
    console.log('Body:  ', request.body);
    console.log('---');
    next();
}

app.use(requestLogger);

app.get('/api/info', (request, response, next) => {
    Person.find({}).then(people => {
        response.send(`
            <div>Phonebook has info for ${people.length} people</div>
            <br>
            <div>${new Date()}</div>`);
        })
        .catch(next);
});

app.get('/api/persons', (request, response, next) => {
    Person.find({})
        .then(people => {
            response.json(people);
        })
        .catch(next);
});

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            response.json(person);
        })
        .catch(next);
});

app.post('/api/persons', (request, response, next) => {
    const body = request.body;

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'content missing'
        });
    }

    const person = new Person({
        name: body.name,
        number: body.number
    });

    person.save()
        .then(savedPerson => {
            response.json(savedPerson);
        })
        .catch(next);
});

app.use(errorHandling);

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body;

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, {new: true})
        .then(updatedPerson => {
            response.json(updatedPerson);
        })
        .catch(next);

});

app.use(errorHandling);

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(() => response.status(204).end())
        .catch(next);
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' });
}

app.use(unknownEndpoint);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
