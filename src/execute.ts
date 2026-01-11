import Docker = require('dockerode');
import { PassThrough } from 'stream'; // 👈 Importamos esto correctamente arriba

const docker = new Docker();

async function runCode() {
    console.log("🚀 Iniciando Motor de Ejecución...");

    const IMAGE = 'python:3.9-alpine';
    const USER_CODE = 'print("¡Hola! Soy Python corriendo dentro de un Docker controlado por Node.js")';
    const CMD = ['python', '-c', USER_CODE];

    try {
        // 👈 Ahora usamos la clase importada limpiamente
        const logStream = new PassThrough();
        
        let outputData = '';
        logStream.on('data', (chunk: any) => {
            outputData += chunk.toString();
        });

        console.log(`🐳 Buscando/Descargando imagen ${IMAGE}... (Esto puede tardar la primera vez)`);

        const [data, container] = await docker.run(
            IMAGE, 
            CMD, 
            logStream, 
            {
                HostConfig: {
                    AutoRemove: true, 
                    NetworkMode: 'none', 
                    Memory: 50 * 1024 * 1024, 
                }
            }
        );

        console.log("✅ Ejecución finalizada.");
        console.log("---------------------------------------------------");
        console.log("📜 SALIDA CAPTURADA DEL CONTENEDOR:");
        console.log(outputData);
        console.log("---------------------------------------------------");

    } catch (error) {
        console.error("❌ Error en la ejecución:", error);
    }
}

runCode();