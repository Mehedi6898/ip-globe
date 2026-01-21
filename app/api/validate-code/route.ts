import { NextResponse } from "next/server";

// parse allowed codes from env
const ALLOWED_CODES: string[] = JSON.parse(process.env.ALLOWED_CODES || "[]");

/**
 * For each prefix we store an array of message lines.
 * These will be joined with '\n' and returned as a single string.
 * Edit these lines whenever you want to change the displayed text.
 */
const MESSAGE_LINES: Record<string, string[]> = {
  sc_A: [
    "🍏 You're trying to Access Apple of Fortune Script",
    "Server Connection Error! Server Connection Error!",
    "Server Connection is being blocked on client's device",
    "Unable to send results to client side",
    "Main Server status - ok",
    "Client side status - unable to receive!",
    "Buy AntiDetect to establish connection",
    "Message @Bytron",
  ],
  sc_T: [
    "🎯 You're trying to Access Thimble Script",
    "Server Connection Error! Server Connection Error!",
    "Server Connection is being blocked on client's device",
    "Unable to send results to client side",
    "Main Server status - ok",
    "Client side status - unable to receive!",
    "Buy AntiDetect to establish connection",
    "Message @Bytron",
  ],
  sc_W: [
    "🕶 You're trying to Access Wild West Gold Script",
    "Server Connection Error! Server Connection Error!",
    "Server Connection is being blocked on client's device",
    "Unable to send results to client side",
    "Main Server status - ok",
    "Client side status - unable to receive!",
    "Buy AntiDetect to establish connection",
    "Message @Bytron",
  ],
  "1_": [
    "🔐 You're trying to Access Aviator Predictor App",
    "Server Connection Error! Server Connection Error!",
    "Server Connection is being blocked on client's device",
    "Unable to send results to client side",
    "Main Server status - ok",
    "Client side status - unable to receive!",
    "Buy AntiDetect to establish connection",
    "Message @Bytron",
  ],
   "sc_M": [
    "🔐 You're trying to Access 1WinxMines Script",
    "Server Connection Error! Server Connection Error!",
    "Server Connection is being blocked on client's device",
    "Unable to send results to client side",
    "Main Server status - ok",
    "Client side status - unable to receive!",
    "Buy AntiDetect to establish connection",
    "Message @Bytron",
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const code = (body?.code ?? "").toString().trim();

    if (!code) {
      return NextResponse.json({ ok: false, error: "No code provided" }, { status: 400 });
    }

    // check whitelist
    if (!ALLOWED_CODES.includes(code)) {
      return NextResponse.json({ ok: false, error: "Invalid or unauthorized code" }, { status: 401 });
    }

    // detect prefix
    let prefix = "";
    if (code.startsWith("sc_A")) prefix = "sc_A";
    else if (code.startsWith("sc_T")) prefix = "sc_T";
    else if (code.startsWith("sc_W")) prefix = "sc_W";
    else if (code.startsWith("1_")) prefix = "1_";
    else if (code.startswith("sc_M")) prefix = "sc_M";
    else prefix = "unknown";

    // build final message (multiline)
    const lines = MESSAGE_LINES[prefix] ?? ["✅ Access Granted — Default route active."];
    const message = lines.join("\n");

    return NextResponse.json({
      ok: true,
      type: prefix,
      message,
    });
  } catch (err) {
    console.error("validate-code error:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
