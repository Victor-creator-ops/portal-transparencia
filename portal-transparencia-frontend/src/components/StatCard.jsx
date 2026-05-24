/**
 * Cartão de estatística simples para o painel principal.
 * Mostra um rótulo, valor e pequeno resumo de tendência.
 */
function StatCard({ label, value, trend, color = 'bg-white', icon }) {
  return (
    <div className={`rounded-3xl border border-slate-200 shadow-sm p-5 ${color}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.15em]">{label}</p>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">{value}</p>
          {trend && <p className="mt-2 text-sm text-slate-500">{trend}</p>}
        </div>
        {icon && <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">{icon}</div>}
      </div>
    </div>
  );
}

export default StatCard;
