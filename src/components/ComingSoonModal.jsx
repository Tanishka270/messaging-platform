import "./ComingSoonModal.css";

// UI-only feedback for features that are intentionally not implemented.
const ComingSoonModal = ({ feature, description, onClose }) => (
  <div className="coming-soon-backdrop" role="presentation" onClick={onClose}>
    <section
      className="coming-soon-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="coming-soon-title"
      onClick={(event) => event.stopPropagation()}
    >
      <button className="coming-soon-close" type="button" aria-label="Close" onClick={onClose}>×</button>
      <div className="coming-soon-icon" aria-hidden="true">✦</div>
      <p className="coming-soon-eyebrow">Coming soon</p>
      <h2 id="coming-soon-title">{feature}</h2>
      <p>{description}</p>
      <button className="coming-soon-confirm" type="button" onClick={onClose}>Got it</button>
    </section>
  </div>
);

export default ComingSoonModal;
