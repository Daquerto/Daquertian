type LinksPanelProps = {
  links: string[];
};

function LinksPanel({ links }: LinksPanelProps) {
  return (
    <div className="links-panel">
      <h3>Связи в заметке</h3>

      {links.length === 0 ? (
        <p>Связей пока нет.</p>
      ) : (
        <ul>
          {links.map((link) => (
            <li key={link}>{link}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LinksPanel;
