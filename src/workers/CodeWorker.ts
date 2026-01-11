import { Worker, Job } from 'bullmq';
import { Executor } from '../lib/Executor';

// Definimos la estructura de datos que esperamos recibir en la cola
export interface CodeJobData {
    code: string;
    language: 'python'; // Por ahora restringido a lo que soporta Executor
}

// Configuración de conexión a Redis (Puerto estándar mapeado en Docker)
const connection = {
    host: 'localhost', 
    port: 6379 
};

const QUEUE_NAME = 'code-execution-queue';

// Instanciamos el Executor una vez para reutilizar la conexión a Dockerode
const engine = new Executor();

/**
 * Worker que procesa los trabajos de ejecución de código.
 */
export const codeWorker = new Worker<CodeJobData>(
    QUEUE_NAME,
    async (job: Job<CodeJobData>) => {
        console.log(`⚙️ [Worker ${job.id}] Procesando código Python...`);

        const { code } = job.data;

        if (!code) {
            throw new Error("El payload del trabajo no contiene la propiedad 'code'.");
        }

        // Ejecutamos el código usando la lógica encapsulada en la librería
        // Nota: Executor maneja internamente sus errores de runtime y devuelve un objeto seguro
        const result = await engine.runPython(code);

        console.log(`✅ [Worker ${job.id}] Terminado. Tiempo: ${result.executionTimeMs}ms`);
        
        // Retornamos el resultado para que BullMQ lo almacene (puede ser leído después por el API)
        return result;
    },
    {
        connection,
        concurrency: 5 // Permite procesar hasta 5 contenedores simultáneamente si la máquina lo aguanta
    }
);

// Eventos básicos para monitoreo en consola
codeWorker.on('ready', () => {
    console.log(`🚀 Worker conectado a Redis y escuchando en '${QUEUE_NAME}'`);
});

codeWorker.on('failed', (job, err) => {
    console.error(`❌ [Worker ${job?.id}] Falló con error: ${err.message}`);
});