import puppeteer from "puppeteer";

async function scrapeSokker(headless = true, takeScreenshot = false) {
  // Configuración específica para Render
  const browser = await puppeteer.launch({ 
    headless: headless,
    defaultViewport: null,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null // Usa la variable de entorno si existe
  });
  
  const page = await browser.newPage();
  
  // Configurar console messages para ver los logs del navegador
  page.on('console', msg => {
    console.log('CONSOLA DEL NAVEGADOR:', msg.text());
  });
  
  // Navegar a la página de login
  await page.goto('https://sokker.org/es/app/login/', { 
    waitUntil: 'networkidle2',
    timeout: 60000 
  });
  
  // Esperar a que los campos de login estén disponibles
  await page.waitForSelector('#user-name', { timeout: 10000 });
  await page.waitForSelector('.input-password .input__control', { timeout: 10000 });
  
  // Rellenar credenciales (en producción, usar variables de entorno)
  await page.type('#user-name', 'heraldofortuna');
  await page.type('.input-password .input__control', 'P!AdFY9UMCC@8xP');
  
  // Hacer clic en el botón de login
  await page.click('.login__submit button');
  
  // Esperar a que la navegación termine
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
  
  // Verificar que el login fue exitoso
  const currentUrl = page.url();
  console.log('URL después del login:', currentUrl);
  
  // Navegar a la página del equipo
  await page.goto('https://sokker.org/es/app/squad/', { 
    waitUntil: 'networkidle2',
    timeout: 60000 
  });
  
  // Esperar a que los datos se carguen
  try {
    await page.waitForSelector('.player-list__item', { timeout: 15000 });
    console.log('Elementos de jugadores encontrados');
  } catch (error) {
    console.log('No se encontraron jugadores, intentando con otro selector...');
    await page.waitForSelector('.view-squad', { timeout: 10000 });
  }
  
  // Hacer scroll para asegurar que todos los elementos se carguen
  await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight);
  });
  
  await page.waitForTimeout(2000);
  
  // Extraer datos
  const squadData = await page.evaluate(() => {
    console.log('Extrayendo datos...');
    
    // Intentar con diferentes selectores
    const players = document.querySelectorAll('.player-list__item') || 
                   document.querySelectorAll('.player-item');
    
    console.log('Número de jugadores encontrados:', players.length);
    
    const data = [];
    players.forEach(player => {
      try {
        // Múltiples formas de intentar obtener los datos
        const nameElem = player.querySelector('.player-box-header__name .fs-13 a') ||
                        player.querySelector('.player-name a') ||
                        player.querySelector('.player-header a');
        
        const ageElem = player.querySelector('.player-box-header__age .fs-13') ||
                       player.querySelector('.player-age') ||
                       player.querySelector('.age-value');
        
        const valueElem = player.querySelector('.player-box-header__value .fs-13') ||
                         player.querySelector('.player-value') ||
                         player.querySelector('.value-amount');
        
        const name = nameElem ? nameElem.innerText.trim() : 'N/A';
        const age = ageElem ? ageElem.innerText.trim() : 'N/A';
        const value = valueElem ? valueElem.innerText.trim() : 'N/A';
        
        console.log('Jugador encontrado:', name, age, value);
        data.push({ name, age, value });
      } catch (e) {
        console.log('Error procesando jugador:', e);
      }
    });
    
    return data;
  });
  
  // Tomar screenshot si se solicita
  if (takeScreenshot) {
    await page.screenshot({ path: 'squad-page.png', fullPage: true });
  }
  
  await browser.close();
  
  return squadData;
}

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

export { scrapeSokker };