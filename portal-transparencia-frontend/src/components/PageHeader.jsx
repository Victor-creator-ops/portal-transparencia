/**
 * Cabeçalho reutilizável para páginas do portal.
 * Recebe título, descrição e área opcional de ações adicionais.
 */
function PageHeader({ title, description, children }) {
  return (
    <div className="mb-8 border-b border-slate-200 pb-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900">{title}</h1>
          <p className="text-gray-600 mt-2 max-w-3xl">{description}</p>
        </div>
        {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
      </div>
    </div>
  );
}

export default PageHeader;
