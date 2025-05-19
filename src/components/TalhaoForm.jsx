import { useState } from "react";

function TalhaoForm({ coordenadas, onSave }) {
  const [nome, setNome] = useState("");
  const [cultura, setCultura] = useState("");
  const [area, setArea] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nome || !cultura || !area) return alert("Preencha todos os campos obrigatórios.");

    const novoTalhao = {
      id: Date.now(),
      nome,
      cultura,
      area: parseFloat(area),
      observacoes,
      coordenadas,
    };

    onSave(novoTalhao);

    // Limpa o formulário
    setNome("");
    setCultura("");
    setArea("");
    setObservacoes("");
  };

  return (
    <form onSubmit={handleSubmit} className="formulario">
      <h2>➕ Cadastrar Talhão</h2>
      <label>Nome do Talhão*</label>
      <input value={nome} onChange={(e) => setNome(e.target.value)} required />

      <label>Cultura Plantada*</label>
      <input value={cultura} onChange={(e) => setCultura(e.target.value)} required />

      <label>Área (ha)*</label>
      <input
        type="number"
        value={area}
        onChange={(e) => setArea(e.target.value)}
        step="0.01"
        required
      />

      <label>Observações</label>
      <textarea
        value={observacoes}
        onChange={(e) => setObservacoes(e.target.value)}
        rows="3"
      />

      <button type="submit">Salvar Talhão</button>
    </form>
  );
}

export default TalhaoForm;
