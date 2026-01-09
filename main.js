const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

process.on('uncaughtException', (error) => {
    console.error("Unexpected error: ", error);
});

// Forzar el factor de escala para pantallas HiDPI
app.commandLine.appendSwitch('high-dpi-support', '1');
app.commandLine.appendSwitch('force-device-scale-factor', '1');

function createWindow() {
    const win = new BrowserWindow({
        width: 1400,
        height: 800,
        minWidth: 1000,  // Establece el ancho mínimo
        minHeight: 600,  // Establece la altura mínima
        webPreferences: {
            contextIsolation: true,
            enableRemoteModule: false,
            zoomFactor: 1.0,
        },
        // Mantener el marco para conservar los botones de cerrar, minimizar y maximizar
        frame: true,
        icon: path.join(__dirname, 'public/Bolsi.png'),
        show: false,  // No mostrar hasta que esté lista
    });

    // Mostrar la ventana cuando esté lista para evitar parpadeos
    win.once('ready-to-show', () => {
        win.show();
    });

    // Cargar la aplicación React construida
    win.loadFile(path.join(__dirname, 'dist', 'index.html')); // Cambia esto para cargar el archivo index.html de la carpeta dist

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
