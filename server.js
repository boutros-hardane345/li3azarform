const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const storagePath = path.join(__dirname, 'storage', 'registrations.json');

// Ensure storage file exists
if (!fs.existsSync(storagePath)) {
    fs.writeFileSync(storagePath, JSON.stringify([]));
}

// Submit registration
app.post('/submit', (req, res) => {
    const { name, group, confirmed, comments } = req.body;

    if (!name || !group || !confirmed) {
        return res.status(400).json({ message: "All fields except comments are required" });
    }

    const newEntry = {
        name,
        group,
        confirmed,
        comments: comments || "",
        date: new Date()
    };

    const data = JSON.parse(fs.readFileSync(storagePath));
    data.push(newEntry);
    fs.writeFileSync(storagePath, JSON.stringify(data, null, 2));

    res.json({ message: "Registration submitted successfully ❤️" });
});

// View all registrations
// View all registrations nicely in HTML
app.get('/results', (req, res) => {
    const data = JSON.parse(fs.readFileSync(storagePath));

    let html = `
    <!DOCTYPE html>
    <html lang="en" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <title>جولة لعازار ٢٠٢٦ - Registrations</title>
        <style>
            body { font-family: Arial, sans-serif; background: #f4f6f9; padding: 20px; }
            h2 { text-align: center; color: #2d89ef; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; border: 1px solid #ccc; text-align: center; }
            th { background: #2d89ef; color: white; }
            tr:nth-child(even) { background: #f2f2f2; }
            tr:hover { background: #d0e4f7; }
        </style>
    </head>
    <body>
        <h2>جولة لعازار ٢٠٢٦ - Registrations</h2>
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Full Name</th>
                    <th>Group</th>
                    <th>Confirmed</th>
                    <th>Comments</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
    `;

    data.forEach((entry, index) => {
        html += `
        <tr>
            <td>${index + 1}</td>
            <td>${entry.name}</td>
            <td>${entry.group}</td>
            <td>${entry.confirmed}</td>
            <td>${entry.comments || '-'}</td>
            <td>${new Date(entry.date).toLocaleString('en-GB')}</td>
        </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    </body>
    </html>
    `;

    res.send(html);
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
