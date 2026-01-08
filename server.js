const express = require("express");
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve the HTML form
app.use(express.static(__dirname));

// Handle form submission
app.post('/submit', (req, res) => {
    const responses = req.body;
    const timestamp = new Date().toISOString();

    // Prepare CSV data
    const csvFile = 'responses.csv';
    const fileExists = fs.existsSync(csvFile);

    // Create header row if file doesn't exist
    if (!fileExists) {
        const headers = ['Timestamp', 'Name'];
        for (let i = 1; i <= 72; i++) {
            headers.push(`Question ${i}`);
        }
        fs.writeFileSync(csvFile, headers.join(',') + '\n');
    }

    // Prepare response row
    const name = responses.participantName || 'Not provided';
    const row = [timestamp, name];
    for (let i = 1; i <= 72; i++) {
        const answer = responses[`question${i}`] || 'Not answered';
        row.push(answer);
    }

    // Append to CSV file
    fs.appendFileSync(csvFile, row.join(',') + '\n');

    // Send success response
    res.send(`
        <html>
            <head>
                <title>Submission Successful</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 600px;
                        margin: 50px auto;
                        padding: 20px;
                        text-align: center;
                    }
                    h1 { color: #4CAF50; }
                    a {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 10px 20px;
                        background-color: #4CAF50;
                        color: white;
                        text-decoration: none;
                        border-radius: 4px;
                    }
                    a:hover { background-color: #45a049; }
                </style>
            </head>
            <body>
                <h1>Thank You!</h1>
                <p>Your questionnaire has been submitted successfully.</p>
                <a href="/">Back to Questionnaire</a>
            </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server');
});
