import { NextResponse } from 'next/server';
import { Queue } from 'bullmq';

// Reutilizamos la configuración de conexión
const connection = {
    host: 'localhost',
    port: 6379,
};

const QUEUE_NAME = 'code-execution-queue';

// Instancia de BullMQ para leer trabajos
const workQueue = new Queue(QUEUE_NAME, { connection });

export async function GET(request: Request) {
    try {
        // Obtener el ID de los parámetros de la URL
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Falta el parámetro "id"' }, { status: 400 });
        }

        // Buscar el trabajo en la cola
        const job = await workQueue.getJob(id);

        if (!job) {
            return NextResponse.json({ error: 'Trabajo no encontrado' }, { status: 404 });
        }

        // Obtener el estado actual (completed, failed, waiting, active, etc.)
        const state = await job.getState();
        
        // Si falló, obtener el motivo
        const failedReason = job.failedReason;

        // Si terminó, obtener el valor de retorno
        const result = job.returnvalue;

        return NextResponse.json({
            id: job.id,
            state,
            result,       // Será null si no ha terminado
            failedReason, // Será null si no falló
            finishedOn: job.finishedOn
        });

    } catch (error: any) {
        console.error("❌ Error en GET /api/status:", error);
        return NextResponse.json(
            { error: "Error interno al consultar el estado." },
            { status: 500 }
        );
    }
}