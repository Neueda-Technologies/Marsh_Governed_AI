type PageHeaderProps = {
  uiState: string;
};

export function PageHeader({ uiState }: PageHeaderProps) {
  return (
    <>
      <h1>Document Extraction Demo</h1>
      <p className="subtitle">TanStack Query client for /documents/extract</p>
      <p className="state">
        Current state: <strong>{uiState}</strong>
      </p>
    </>
  );
}
