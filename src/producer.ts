import { Queue } from 'bullmq';

// Importamos la interfaz para asegurar que enviamos datos válidos
import { CodeJobData } from './workers/CodeWorker';

const QUEUE_NAME = 'code-execution-queue';

// Configuración de conexión (Misma que en el worker)
const connection = {
    host: 'localhost',
    port: 6379
};

// Instanciamos la cola
const myQueue = new Queue<CodeJobData>(QUEUE_NAME, { connection });

async function addJobs() {
    console.log(`🔌 Conectando a la cola: ${QUEUE_NAME}...`);

    // Trabajo 1: Un script simple
    const job1 = await myQueue.add('simple-print', {
        language: 'python',
        code: `print("Hola mundo desde BullMQ Job 1")`
    });
    console.log(`📨 Trabajo enviado: ${job1.id}`);

    // Trabajo 2: Un cálculo matemático (loop)
    const job2 = await myQueue.add('math-calculation', {
        language: 'python',
        code: `
sum = 0
for i in range(10):
    sum += i
print(f"La suma total es: {sum}")
        `
    });
    console.log(`📨 Trabajo enviado: ${job2.id}`);

    // Limpieza: Cerramos la conexión a Redis para que el script termine
    await myQueue.close();
    console.log("👋 Conexión cerrada. Saliendo.");
    process.exit(0);
}

// Ejecutar
addJobs().catch((err) => {
    console.error(err);
    process.exit(1);
});