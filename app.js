const express = require('express');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve the input form at the root URL
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f9;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                }
                .container {
                    background-color: #fff;
                    padding: 20px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    width: 400px;
                    text-align: center;
                }
                h1 {
                    color: #333;
                }
                textarea {
                    width: 100%;
                    height: 150px;
                    padding: 10px;
                    border-radius: 4px;
                    border: 1px solid #ddd;
                    margin-bottom: 20px;
                }
                button {
                    background-color: #28a745;
                    color: #fff;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                }
                button:hover {
                    background-color: #218838;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>PDF Generator</h1>
                <form action="/generate-pdf" method="post">
                    <label for="text">Enter text for the PDF:</label><br><br>
                    <textarea id="text" name="text"></textarea><br><br>
                    <button type="submit">Generate PDF</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

// Endpoint to generate PDF
app.post('/generate-pdf', (req, res) => {
    const userText = req.body.text;
    const doc = new PDFDocument();

    // Set the output path for the PDF file
    const outputPath = path.join(__dirname, 'output.pdf');

    // Pipe the PDF document to a file
    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    // Add user text to the PDF
    doc.fontSize(12).text(userText, {
        align: 'left'
    });

    // Finalize the PDF and end the stream
    doc.end();

    // Handle the 'finish' event of the write stream
    writeStream.on('finish', () => {
        res.download(outputPath, 'ZahidDockerLearning.pdf', (err) => {
            if (err) {
                console.error('Error downloading the PDF:', err);
                res.status(500).send('Error downloading the PDF');
            } else {
                console.log('PDF generated and sent to the client.');
            }
        });
    });

    // Handle the 'error' event of the write stream
    writeStream.on('error', (err) => {
        console.error('Error writing the PDF to the file system:', err);
        res.status(500).send('Error generating the PDF');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
