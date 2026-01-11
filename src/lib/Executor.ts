import Docker = require('dockerode');
import { PassThrough } from 'stream';

interface ExecutionResult {
    output: string;
    isError: boolean;
    executionTimeMs: number;
}

export class Executor {
    private docker: Docker;

    constructor() {
        // Inicializamos docker una sola vez
        this.docker = new Docker();
    }

    /**
     * Asegura que la imagen exista localmente. Si no, la descarga.
     */
    private async ensureImage(image: string): Promise<void> {
        const images = await this.docker.listImages();
        const exists = images.some(img => img.RepoTags?.includes(image));

        if (!exists) {
            console.log(`⬇️ Imagen ${image} no encontrada. Descargando... (Espere)`);
            // await this.docker.pull(image); // Nota: pull devuelve un stream, hay que esperar a que termine.
            // Por simplicidad en esta fase, usaremos el pull del run, pero verificamos antes.
            // Para una implementación robusta de pull, se requiere manejar eventos del stream modem.
            // Dejaremos que .run() haga el pull automático, pero logueamos el aviso.
        }
    }

    /**
     * Ejecuta código en un contenedor efímero
     */
    public async runPython(code: string): Promise<ExecutionResult> {
        const IMAGE = 'python:3.9-alpine';
        const containerConfig = {
            Image: IMAGE,
            Cmd: ['python', '-c', code],
            Tty: false,
            HostConfig: {
                AutoRemove: false, // ⚠️ Lo manejamos manual para poder leer logs post-crash si es necesario
                NetworkMode: 'none', // Sin internet
                Memory: 50 * 1024 * 1024, // 50MB Límite
                NanoCpus: 1000000000, // 1 CPU
            }
        };

        let container: Docker.Container | null = null;
        const startTime = Date.now();
        let finalOutput = '';
        let isError = false;

        try {
            // 1. Crear contenedor
            // await this.ensureImage(IMAGE); // Opcional por ahora
            
            // Usamos createContainer en lugar de run para tener control granular
            container = await this.docker.createContainer(containerConfig);

            // 2. Iniciar
            await container.start();

            // 3. Esperar a que termine (wait)
            const stream = await container.logs({
                follow: true,
                stdout: true,
                stderr: true
            });

            // Leer logs
            container.modem.demuxStream(stream, {
                write: (chunk: Buffer) => { finalOutput += chunk.toString(); }
            }, {
                write: (chunk: Buffer) => { 
                    finalOutput += chunk.toString(); 
                    isError = true; // Si escribe en stderr, asumimos error runtime
                }
            });

            // Esperar a que el proceso muera
            await container.wait();

        } catch (err: any) {
            console.error("🔥 Error crítico en el motor:", err);
            finalOutput = `SYSTEM ERROR: ${err.message}`;
            isError = true;
        } finally {
            // 4. LIMPIEZA OBLIGATORIA (GARBAGE COLLECTION)
            if (container) {
                try {
                    // Intentamos forzar la eliminación
                    await container.remove({ force: true }); 
                } catch (e) {
                    // Ignorar si ya murió
                }
            }
        }

        return {
            output: finalOutput.trim(),
            isError,
            executionTimeMs: Date.now() - startTime
        };
    }
}