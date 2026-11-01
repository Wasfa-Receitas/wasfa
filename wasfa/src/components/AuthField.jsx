export default function AuthField({ id, label, type = "text", placeholder, autoComplete, icon }) {
  return <div className="input-group"><label htmlFor={id}>{label}</label><div className="campo"><i className={"fa-solid fa-" + icon} /><input id={id} name={id} type={type} placeholder={placeholder} autoComplete={autoComplete} required /></div></div>;
}
