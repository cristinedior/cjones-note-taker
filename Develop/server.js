const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve your static files

// Implement API and HTML routes here

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const readAndWriteJSONFile = (callback) => {
    fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            callback(null, err);
            return;
        }
        const notes = JSON.parse(data);
        callback(notes, (updatedNotes, cb) => {
            fs.writeFile(path.join(__dirname, 'db', 'db.json'), JSON.stringify(updatedNotes, null, 2), (err) => {
                if (err) {
                    console.error(err);
                    cb(err);
                    return;
                }
                cb(null);
            });
        });
    });
};

// API route for getting all notes
app.get('/api/notes', (req, res) => {
    fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error reading notes" });
        }
        res.json(JSON.parse(data));
    });
});

// API route for posting a new note
app.post('/api/notes', (req, res) => {
    const newNote = { ...req.body, id: uuidv4() };

    readAndWriteJSONFile((notes, saveNotes) => {
        // Error handling example
        if (!newNote.title || !newNote.text) {
            return res.status(400).json({ message: "Note title and text are required." });
        }

        notes.push(newNote);
        saveNotes(notes, () => {
            res.json(newNote); // Successfully respond with the new note
        });
    });
});