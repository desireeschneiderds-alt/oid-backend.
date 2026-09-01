const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/generate-gme', (req, res) => {
    const { yamlContent, audioFiles } = req.body; 
    // audioFiles Format: { "aufgabe_1_anleitung": "base64String...", "begruessung_willkommen": "base64String..." }

    if (!yamlContent) {
        return res.status(400).json({ error: 'Kein YAML-Inhalt übergeben.' });
    }

    const tempDir = path.join(__dirname, 'temp_' + Date.now());
    const audioDir = path.join(tempDir, 'audio');
    
    fs.mkdirSync(audioDir, { recursive: true });

    const tempYamlPath = path.join(tempDir, 'project.yaml');
    const tempGmePath = path.join(tempDir, 'output.gme');

    // 1. Audio-Dateien aus Base64 dekodieren und speichern
    if (audioFiles && typeof audioFiles === 'object') {
        Object.keys(audioFiles).forEach(filename => {
            // Endung entfernen falls vorhanden, tttool sucht ohne Endung
            const cleanName = filename.replace(/\.(mp3|ogg|wav|flac)$/i, '');
            const base64Data = audioFiles[filename].replace(/^data:audio\/\w+;base64,/, '');
            const filePath = path.join(audioDir, `${cleanName}.mp3`);
            fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        });
    }

    // 2. Clean Dateiendungen im YAML-Text (z.B. datei.mp3 -> datei)
    const cleanedYamlContent = yamlContent.replace(/([a-zA-Z0-9_\-]+)\.(mp3|ogg|wav|flac)/g, '$1');
    fs.writeFileSync(tempYamlPath, cleanedYamlContent, 'utf8');

    // 3. tttool im temporären Ordner ausführen
    exec(`tttool assemble project.yaml output.gme`, { cwd: tempDir }, (error, stdout, stderr) => {
        if (error) {
            console.error('tttool Error Output:', stderr || stdout);
            fs.rmSync(tempDir, { recursive: true, force: true });
            return res.status(400).json({ 
                error: 'tttool Kompilierung fehlgeschlagen', 
                details: stderr || stdout 
            });
        }

        res.download(tempGmePath, 'output.gme', () => {
            fs.rmSync(tempDir, { recursive: true, force: true });
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
