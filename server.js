const express = require("express");
const { google } = require('googleapis');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve the HTML form
app.use(express.static(__dirname));

//Serve index.html at root path
app.get('/', (req, res) => {
    res.sendFile(_dirname + '/index.html');
});

// Google Sheets setup
const SHEET_ID = '15vj6NQxvbrGEjJqAu5fq4PD2duMabGtI-p7LP_fGK8g';

async function appendToSheet(data) {
    try {
        // Load credentials from environment variable or file
        let credentials;
        if (process.env.GOOGLE_CREDENTIALS) {
            credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        } else {
            credentials = JSON.parse(fs.readFileSync('credentials.json'));
        }
        
        // Authenticate
        const auth = new google.auth.GoogleAuth({
            credentials: credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        
        const sheets = google.sheets({ version: 'v4', auth });
        
        // Check if sheet has headers
        const checkHeaders = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: 'Sheet1!A1:BX1',
        });
        
        // If no headers, add them
        if (!checkHeaders.data.values || checkHeaders.data.values.length === 0) {
            const headers = ['Timestamp', 'Name'];
            for (let i = 1; i <= 72; i++) {
                headers.push(`Question ${i}`);
            }
            await sheets.spreadsheets.values.update({
                spreadsheetId: SHEET_ID,
                range: 'Sheet1!A1',
                valueInputOption: 'RAW',
                resource: { values: [headers] },
            });
        }
        
        // Append the data
        await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: 'Sheet1!A:BX',
            valueInputOption: 'RAW',
            resource: { values: [data] },
        });
        
        return true;
    } catch (error) {
        console.error('Error writing to sheet:', error);
        return false;
    }
}

// Handle form submission
app.post('/submit', async (req, res) => {
    const responses = req.body;
    const now = new Date();
    const timestamp = now.toLocaleString('en-US', {
        timeZone: 'America/Chicago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const name = responses.participantName || 'Not provided';
    
    // Prepare response row
    const row = [timestamp, name];
    for (let i = 1; i <= 72; i++) {
        const answer = responses[`question${i}`] || 'Not answered';
        row.push(answer);
    }
    
    // Write to Google Sheets
    const success = await appendToSheet(row);
    
    if (success) {
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
    } else {
        res.status(500).send('Error submitting form. Please try again.');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server');
});
