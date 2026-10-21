export default function SiteFooter() {
  return (
    <footer>
      <a className="monogram" href="#home">
        PP<span>.</span>
      </a>
      <p>Designed &amp; engineered with intention.</p>
      <a href="#home">Back to top ↑</a>
      <small>{`© ${new Date().getFullYear()} Prasadh Pathiraja`}</small>
    </footer>
  );
}
