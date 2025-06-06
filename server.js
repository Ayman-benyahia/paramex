// Local dependencies
const path = require('path');

// External dependencies
const dotenv = require('dotenv');
dotenv.config();


const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views', './app/views');


// Serve static files
app.use(express.static('public'));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Parse JSON bodies
app.use(express.json());


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Paramex backend started. Listening on port http://localhost:${PORT}...`);
});
