import { ImageResponse } from "next/og";

export const alt = "El Legado - Catering y Eventos Premium";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FAF9F6 0%, #F5F0EB 50%, #E8DED5 100%)",
          fontFamily: "serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "linear-gradient(90deg, #AF7A54, #D9A78B, #AF7A54)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "#AF7A54",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <span style={{ color: "white", fontSize: 48, fontWeight: 700 }}>L</span>
          </div>
          <h1
            style={{
              fontSize: 72,
              fontWeight: 400,
              color: "#1A1A1A",
              letterSpacing: "0.4em",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            EL LEGADO
          </h1>
          <p
            style={{
              fontSize: 24,
              color: "#AF7A54",
              letterSpacing: "0.2em",
              margin: 0,
              fontWeight: 300,
              textTransform: "uppercase",
            }}
          >
            Catering & Eventos
          </p>
          <p
            style={{
              fontSize: 18,
              color: "#64748B",
              margin: "24px 0 0",
              fontStyle: "italic",
              fontWeight: 300,
            }}
          >
            Haz eterno cada momento
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "linear-gradient(90deg, #AF7A54, #D9A78B, #AF7A54)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
