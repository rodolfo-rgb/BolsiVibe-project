const { app, BrowserWindow, Menu, screen } = require('electron');
const path = require('path');

process.on('uncaughtException', (error) => {
    console.error("Unexpected error: ", error);
});

// Optimización para Linux - Deshabilitar aceleración de hardware si causa problemas
if (process.platform === 'linux') {
    // Usar el backend de renderizado nativo de Linux
    app.commandLine.appendSwitch('enable-features', 'UseOzonePlatform');
    app.commandLine.appendSwitch('ozone-platform-hint', 'auto');
}

// Soporte para pantallas HiDPI - NO forzar factor de escala fijo
app.commandLine.appendSwitch('high-dpi-support', '1');
// Eliminar force-device-scale-factor para respetar la escala del sistema

function createWindow() {
    // Obtener información de la pantalla principal
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
    const scaleFactor = primaryDisplay.scaleFactor;
    
    console.log(`Screen: ${screenWidth}x${screenHeight}, Scale Factor: ${scaleFactor}`);
    
    // Calcular dimensiones óptimas basadas en la pantalla
    // Usar 85% del área de trabajo disponible
    const windowWidth = Math.min(Math.round(screenWidth * 0.85), 1600);
    const windowHeight = Math.min(Math.round(screenHeight * 0.85), 1000);
    
    // Mínimos más pequeños para pantallas pequeñas
    const minWidth = Math.min(900, Math.round(screenWidth * 0.6));
    const minHeight = Math.min(600, Math.round(screenHeight * 0.6));

    const win = new BrowserWindow({
        width: windowWidth,
        height: windowHeight,
        minWidth: minWidth,
        minHeight: minHeight,
        webPreferences: {
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
            // No forzar zoomFactor, dejar que el sistema lo maneje
        },
        // Mantener el marco para conservar los botones de cerrar, minimizar y maximizar
        frame: true,
        // Centrar la ventana en la pantalla
        center: true,
        icon: path.join(__dirname, 'public/Bolsi.png'),
        show: false,  // No mostrar hasta que esté lista
        // Opciones adicionales para mejor renderizado en Linux
        backgroundColor: '#ffffff',
        autoHideMenuBar: true,
    });

    // Maximizar la ventana por defecto para mejor experiencia
    win.maximize();

    // Mostrar la ventana cuando esté lista para evitar parpadeos
    win.once('ready-to-show', () => {
        win.show();
        win.focus();
    });

    // Manejar cambios de escala de pantalla en tiempo de ejecución
    win.on('moved', () => {
        const currentDisplay = screen.getDisplayMatching(win.getBounds());
        if (currentDisplay.scaleFactor !== scaleFactor) {
            console.log(`Display scale changed to: ${currentDisplay.scaleFactor}`);
        }
    });

    // Cargar la aplicación React construida
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));

    Menu.setApplicationMenu(null);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
