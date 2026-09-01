const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/generate-gme', (req, res) => {
    const { yamlContent } = req.body;

    if (!yamlContent) {
        return res.status(400).json({ error: 'Kein YAML-Inhalt übergeben.' });
    }

    const tempYamlPath = path.join(__dirname, 'temp.yaml');
    const tempGmePath = path.join(__dirname, 'temp.gme');

    // 1. YAML-Datei schreiben
    fs.writeFileSync(tempYamlPath, yamlContent, 'utf8');

    // 2. tttool assemble ausführen
    exec(`tttool assemble ${tempYamlPath} ${tempGmePath}`, (error, stdout, stderr) => {
        if (error) {
            console.error('tttool Fehler-Log:', stderr || stdout);
            return res.status(400).json({ 
                error: 'YAML-Kompilierung fehlgeschlagen', 
                details: stderr || stdout 
            });
        }

        // 3. GME-Datei an den Client senden
        res.download(tempGmePath, 'output.gme', () => {
            // Aufräumen nach Download
            if (fs.existsSync(tempYamlPath)) fs.unlinkSync(tempYamlPath);
            if (fs.existsSync(tempGmePath)) fs.unlinkSync(tempGmePath);
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
