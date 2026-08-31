const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/generate-gme', (req, res) => {
  const { yamlContent } = req.body;
  
  if (!yamlContent) {
    return res.status(400).json({ error: 'Kein YAML-Inhalt übergeben.' });
  }

  const workDir = path.join(__dirname, 'temp_' + Date.now());
  fs.mkdirSync(workDir);

  const yamlPath = path.join(workDir, 'project.yaml');
  fs.writeFileSync(yamlPath, yamlContent);

  exec('tttool assemble project.yaml', { cwd: workDir }, (error, stdout, stderr) => {
    if (error) {
      fs.rmSync(workDir, { recursive: true, force: true });
      return res.status(500).json({ error: stderr || error.message });
    }

    const files = fs.readdirSync(workDir);
    const gmeFile = files.find(f => f.endsWith('.gme'));

    if (!gmeFile) {
      fs.rmSync(workDir, { recursive: true, force: true });
      return res.status(500).json({ error: 'GME-Datei wurde nicht erzeugt.' });
    }

    const filePath = path.join(workDir, gmeFile);
    res.download(filePath, gmeFile, () => {
      fs.rmSync(workDir, { recursive: true, force: true });
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
