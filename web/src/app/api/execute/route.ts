import { NextResponse } from 'next/server';
import { Queue } from 'bullmq';

// Interfaz para el cuerpo de la solicitud
interface ExecuteRequest {
    code: string;
    language: string;
}

// Configuración de conexión a Redis (Debe coincidir con la del backend)
const connection = {
    host: 'localhost',
    port: 6379,
};

const QUEUE_NAME = 'code-execution-queue';

// Instanciamos la cola. 
// Nota: En un entorno Next.js de producción real, se recomienda usar un patrón Singleton 
// para evitar múltiples conexiones a Redis durante el hot-reloading.
const workQueue = new Queue(QUEUE_NAME, { connection });

export async function POST(request: Request) {
    try {
        // Parsear el JSON del body
        const body: ExecuteRequest = await request.json();
        const { code, language } = body;

        // Validación básica
        if (!code || typeof code !== 'string' || code.trim() === '') {
            return NextResponse.json(
                { error: "El campo 'code' es obligatorio y no puede estar vacío." },
                { status: 400 }
            );
        }

        console.log(`📥 API recibida: Ejecutar ${language || 'python'}`);

        // Agregamos el trabajo a la cola
        // Usamos la misma estructura de datos que espera src/workers/CodeWorker.ts
        const job = await workQueue.add('web-submission', {
            code,
            language: (language as 'python') || 'python'
        });

        // Retornamos éxito con el ID del trabajo para hacer polling después
        return NextResponse.json({
            success: true,
            jobId: job.id
        });

    } catch (error: any) {
        console.error("❌ Error en POST /api/execute:", error);
        return NextResponse.json(
            { error: "Error interno del servidor al encolar el trabajo.", details: error.message },
            { status: 500 }
        );
    }
}
