type RequestErrorPanelProps = {
  message: string;
};

export function RequestErrorPanel({ message }: RequestErrorPanelProps) {
  return (
    <section className="panel error">
      <h2>Request error</h2>
      <p>{message}</p>
    </section>
  );
}
