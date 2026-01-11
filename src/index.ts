import { Executor } from './lib/Executor';

async function main() {
    const engine = new Executor();

    console.log("🧪 Probando Motor de Ejecución Modular...");

    const testCode = `
import sys
print("Hola desde la Clase Executor!")
print("Suma: " + str(10 + 20))
# Simulamos un error para probar stderr
# sys.stderr.write("Esto es un error simulado\\n")
`;

    const result = await engine.runPython(testCode);

    console.log("---------------------------------");
    console.log(`⏱️ Tiempo: ${result.executionTimeMs}ms`);
    console.log(`🚩 Error: ${result.isError}`);
    console.log("📜 Salida:");
    console.log(result.output);
    console.log("---------------------------------");
}

main();