import { NextRequest, NextResponse } from "next/server";

// 👇 Por ahora solo guardamos el último dato en memoria (para pruebas)
let lastPayload: any = null;

// ESP32 envía datos con POST
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Aquí podrías validar campos si quieres:
    // if (typeof body.temperatura !== "number") { ... }

    lastPayload = {
      ...body,
      receivedAt: Date.now(),
    };

    console.log("✅ Nuevo dato desde ESP32:", lastPayload);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ Error en POST /api/sensores:", err);
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }
}

// Frontend consulta los datos con GET
export async function GET() {
  return NextResponse.json({
    ok: true,
    data: lastPayload, // será null hasta que la ESP32 mande algo
  });
}
