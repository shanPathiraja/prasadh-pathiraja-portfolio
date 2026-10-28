export default function SiteFooter() {
  return (
    <footer className="foot">
      <div className="shell foot-in">
        <p>{`© ${new Date().getFullYear()} Buddhika Prasadh Pathiraja. All rights reserved.`}</p>
        <a className="brand" href="#home">
          <span className="brand-mark">BP</span>
          <span className="brand-text">
            <strong>Buddhika Prasadh Pathiraja</strong>
          </span>
        </a>
      </div>
    </footer>
  );
}
