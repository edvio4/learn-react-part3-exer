const mongoose = require('mongoose');

if ( process.argv.length<3 ) {
    console.log('give password as argument');
    process.exit(1);
}

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

const url =
`mongodb+srv://fulstack:${password}@phonebook-vdxnh.mongodb.net/phonebook-app?retryWrites=true&w=majority`;

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const personSchema = new mongoose.Schema({
    name: String,
    number: String
});

const Person = mongoose.model('Person', personSchema);

const person = new Person({ name, number });

if (!name || !number) {
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(person);
        });
        mongoose.connection.close();
    });
} else {
    person.save().then(response => {
        console.log(`added ${response.name} number ${response.number} to phonebook`);
        mongoose.connection.close();
    });
}
