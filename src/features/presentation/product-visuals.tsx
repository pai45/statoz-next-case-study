import {DeviceFrame} from '../../design-system/components/layout/device-frame';
import {imagePath} from '../../content';
export function isLandscapeCapture(id:string){return id.startsWith('game-source-')||id.endsWith('-landscape')||id==='games-home'||id==='games-library'}
export function ProductDevice({id,label,className=''}:{id:string;label:string;className?:string}){
 return <DeviceFrame orientation={isLandscapeCapture(id)?'landscape':'portrait'} className={className} label={label}><img src={imagePath(id)} alt={label} loading={className.includes('hero')?'eager':'lazy'} draggable={false}/></DeviceFrame>;
}
