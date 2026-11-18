import type {ReactNode} from 'react';
import './laptop-frame.css';
export function LaptopFrame({children,label,className=''}:{children:ReactNode;label:string;className?:string}){return <div className={'laptop-frame '+className} role="group" aria-label={label}><div className="laptop-lid"><div className="laptop-camera" aria-hidden="true"/><div className="laptop-screen">{children}</div><div className="laptop-chin" aria-hidden="true">StatOz</div></div><div className="laptop-base" aria-hidden="true"><span/></div></div>}
