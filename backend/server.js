import express from 'express';
import cors from 'cors';
import { scrapeSokker } from './index.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://localhost:3000', 'https://tu-dominio-nextjs.vercel.app'], // Agrega tus URLs
  credentials: true
}));
app.use(express.json());

// Ruta para health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor de scraping funcionando' });
});

// Ruta principal de scraping
app.post('/scrape', async (req, res) => {
  try {
    console.log('Solicitud de scraping recibida');
    const { headless = true, screenshot = false } = req.body;
    
    // Ejecutar el scraping
    const players = await scrapeSokker(headless, screenshot);
    
    res.json({
      success: true,
      players: players,
      count: players.length,
      message: 'Scraping completado exitosamente'
    });
  } catch (error) {
    console.error('Error en scraping:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error al realizar el scraping'
    });
  }
});

app.listen(port, () => {
  console.log(`Servidor de scraping ejecutándose en http://localhost:${port}`);
});