export default function LegendaTabel() {
  return (
    <div className="table-legend">
      <span className="legend-item">
        <span className="legend-symbol plus">+</span>
        <span>= penambahan stok (masuk)</span>
      </span>
      <span className="legend-item">
        <span className="legend-symbol minus">−</span>
        <span>= pengurangan stok (keluar)</span>
      </span>
    </div>
  );
}