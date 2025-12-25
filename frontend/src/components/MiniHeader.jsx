import '@styles/comisiones.css';

const MiniHeader = ({ icon = 'info', title, subtitle }) => {
  return (
    <div className="mini-header">
      <div className="mini-title">
        {icon && <span className="material-symbols-outlined mini-icon">{icon}</span>}
        {title}
      </div>
      {subtitle && <p className="mini-subtitle">{subtitle}</p>}
    </div>
  );
};

export default MiniHeader;
