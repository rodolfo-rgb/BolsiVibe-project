const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

process.on('uncaughtException', (error) => {
    console.error("Unexpected error: ", error);
});

function createWindow() {
    const win = new BrowserWindow({
        width: 1315,
        height: 600,
        minWidth: 1315,  // Establece el ancho mínimo
        minHeight: 600,  // Establece la altura mínima
        webPreferences: {
            contextIsolation: true,
            enableRemoteModule: false,
        },
        // Mantener el marco para conservar los botones de cerrar, minimizar y maximizar
        frame: true,
        icon: path.join(__dirname, 'public/Bolsi.png'),
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