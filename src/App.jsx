import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  FeatureGroup,
  Polygon,
  Popup,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import "./App.css";
import * as turf from "@turf/turf";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import TalhaoPreviewMap from "./components/TalhaoPreviewMap";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function App() {
  const [talhoes, setTalhoes] = useState(() => {
    const salvo = localStorage.getItem("talhoes_polygon");
    return salvo ? JSON.parse(salvo) : [];
  });

  const excluirTalhao = (id) => {
    if (!confirm("Deseja realmente excluir este talhão?")) return;
    const atualizado = talhoes.filter((t) => t.id !== id);
    setTalhoes(atualizado);
    localStorage.setItem("talhoes_polygon", JSON.stringify(atualizado));
  };

  const salvarTalhao = async (coordenadas, areaAuto) => {
    const nome = prompt("Nome do talhão:");
    if (!nome) return;

    const cultura = prompt("Cultura plantada:");
    if (!cultura) return;

    const observacoes = prompt("Observações:");

    const novo = {
      id: Date.now(),
      nome,
      cultura,
      area: parseFloat(areaAuto.toFixed(2)),
      observacoes,
      coordenadas,
    };

    const atualizado = [...talhoes, novo];
    setTalhoes(atualizado);
    localStorage.setItem("talhoes_polygon", JSON.stringify(atualizado));
  };

  const exportarParaPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");

    for (let i = 0; i < talhoes.length; i++) {
      const t = talhoes[i];
      const el = document.getElementById(`preview-talhao-${t.id}`);

      if (!el) {
        alert(`Mapa do talhão "${t.nome}" ainda não foi renderizado.`);
        continue;
      }

      await new Promise((resolve) => {
        const imgs = el.querySelectorAll("img");
        let loaded = 0;

        imgs.forEach((img) => {
          if (img.complete) {
            loaded++;
          } else {
            img.onload = () => {
              loaded++;
              if (loaded === imgs.length) resolve();
            };
          }
        });

        if (loaded === imgs.length) resolve();
      });

      const canvas = await html2canvas(el, { useCORS: true });
      const imgData = canvas.toDataURL("image/png");

      if (i !== 0) pdf.addPage();

      pdf.setFontSize(16);
      pdf.text(`Talhão: ${t.nome}`, 10, 20);
      pdf.addImage(imgData, "PNG", 10, 25, 190, 100);
      pdf.setFontSize(12);
      pdf.text(`🌱 Cultura: ${t.cultura}`, 10, 135);
      pdf.text(`📏 Área: ${t.area} ha`, 10, 142);
      if (t.observacoes) {
        pdf.text(`📝 Obs: ${t.observacoes}`, 10, 149);
      }
    }

    pdf.save("talhoes-mapeados.pdf");
  };

  return (
    <div className="container">
      <h1>📍 Mapeamento de Talhões</h1>

      <div className="exportar-container">
        <button onClick={exportarParaPDF} className="exportar-btn">
          📤 Exportar PDF
        </button>
      </div>

      <MapContainer center={[-15.78, -47.93]} zoom={5} style={{ height: "500px", width: "100%" }}>
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          attribution='&copy; Stadia Maps'
        />

        <FeatureGroup>
          <EditControl
            position="topright"
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              polyline: false,
              marker: false,
            }}
            onCreated={(e) => {
              const layer = e.layer;
              const latlngs = layer.getLatLngs()[0];

              const coordinates = latlngs.map((latlng) => [latlng.lng, latlng.lat]);
              coordinates.push(coordinates[0]);

              const polygon = turf.polygon([coordinates]);
              const area_m2 = turf.area(polygon);
              const area_ha = area_m2 / 10000;

              salvarTalhao(latlngs, area_ha);
            }}
          />
        </FeatureGroup>

        {talhoes.map((t) => (
          <Polygon key={t.id} positions={t.coordenadas}>
            <Popup>
              <strong>{t.nome}</strong><br />
              🌱 {t.cultura}<br />
              📏 {t.area} ha<br />
              🧭 {t.coordenadas[0].lat.toFixed(5)}, {t.coordenadas[0].lng.toFixed(5)}<br />
              {t.observacoes && <><em>📝 {t.observacoes}</em></>}
            </Popup>
          </Polygon>
        ))}
      </MapContainer>

      <div className="lista-talhoes">
        <h2>📋 Talhões Cadastrados</h2>
        <ul>
          {talhoes.map((t) => (
            <li key={t.id}>
              <strong>{t.nome}</strong> — {t.cultura} — {t.area} ha
              <br />
              📝 {t.observacoes}
              <br />
              <button onClick={() => excluirTalhao(t.id)}>Excluir</button>
            </li>
          ))}
        </ul>
      </div>

      <div
        id="preview-container"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: -1,
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        {talhoes.map((t) => (
          <TalhaoPreviewMap
            key={t.id}
            id={`preview-talhao-${t.id}`}
            coordenadas={t.coordenadas}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
