import { MapContainer, TileLayer, Polygon } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// Corrigir ícone padrão
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function calcularCentro(coordenadas) {
  const lats = coordenadas.map((c) => c.lat);
  const lngs = coordenadas.map((c) => c.lng);
  return [
    (Math.min(...lats) + Math.max(...lats)) / 2,
    (Math.min(...lngs) + Math.max(...lngs)) / 2,
  ];
}

const TalhaoPreviewMap = ({ coordenadas, id, onLoad }) => {
  const centro = calcularCentro(coordenadas);

  useEffect(() => {
    const el = document.getElementById(id);
    const tileImgs = el?.querySelectorAll("img") || [];

    let loaded = 0;
    tileImgs.forEach((img) => {
      if (img.complete) {
        loaded++;
      } else {
        img.onload = () => {
          loaded++;
          if (loaded === tileImgs.length && onLoad) onLoad();
        };
      }
    });

    if (loaded === tileImgs.length && onLoad) {
      onLoad();
    }
  }, [id, onLoad]);

  return (
    <div
      id={id}
      style={{
        width: "600px",
        height: "400px",
        marginBottom: "40px",
        backgroundColor: "#1a1a1a",
      }}
    >
      <MapContainer
        center={centro}
        zoom={17}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        />
        <Polygon
          positions={coordenadas.map((c) => [c.lat, c.lng])}
          pathOptions={{ color: "blue" }}
        />
      </MapContainer>
    </div>
  );
};

export default TalhaoPreviewMap;
