import React from 'react';
import { SvgXml } from 'react-native-svg';

const GLASS = `<svg preserveAspectRatio="none" overflow="visible" style="display: block;" width="64" height="76" viewBox="0 0 64 76" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Water glass illustration"><circle id="Soft halo" cx="32" cy="38" r="32" fill="white" fill-opacity="0.0705882"/><path id="Water" d="M12 16.1265C25.3333 2.72196 34.6667 27.6162 52 12.2967L48 56.3402C47.1111 61.4467 44.8889 64 41.3333 64H22.6667C19.1111 64 16.8889 61.4467 16 56.3402L12 16.1265Z" fill="#F6DCE7"/><path id="Glass outline" d="M44.0586 59.3848C43.704 60.691 43.1157 61.5918 42.3408 62.1748C41.5552 62.7657 40.4865 63.0996 39.0586 63.0996H24.9414C23.5135 63.0996 22.4448 62.7657 21.6592 62.1748C20.8842 61.5918 20.295 60.6911 19.9404 59.3848L13.1025 13.2969C25.6969 17.1912 38.3022 17.191 50.8965 13.2969L44.0586 59.3848ZM45.4238 12.9004C36.4729 14.924 27.5271 14.924 18.5762 12.9004H45.4238Z" stroke="#FFF5F8" stroke-width="1.8" stroke-linecap="round"/><path id="Droplet" d="M52 0C51 3 47 7 47 9C47 10.3261 47.5268 11.5979 48.4645 12.5355C49.4021 13.4732 50.6739 14 52 14C53.3261 14 54.5979 13.4732 55.5355 12.5355C56.4732 11.5979 57 10.3261 57 9C57 7 53 3 52 0Z" fill="#F6DCE7"/></g></svg>`;

const ICON = `<svg preserveAspectRatio="none" overflow="visible" style="display: block;" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Water glass"><path id="Glass" d="M6.00015 7.83398C6.6132 7.83405 7.20991 8.0326 7.70035 8.40039C8.36386 8.89791 9.17081 9.16694 10.0001 9.16699C10.4969 9.16699 10.9849 9.06808 11.4396 8.88379L10.963 13.4209C10.9414 13.6257 10.8447 13.8154 10.6916 13.9531C10.5384 14.0908 10.3399 14.1671 10.1339 14.167H5.86343C5.65678 14.1681 5.45687 14.0929 5.30288 13.9551C5.18747 13.8518 5.10447 13.7187 5.0607 13.5723L5.03042 13.4209L4.49136 8.26855C4.94187 7.98526 5.46482 7.83398 6.00015 7.83398ZM11.9269 2.5C11.9502 2.50001 11.973 2.50522 11.9943 2.51465C12.0156 2.52416 12.0353 2.5383 12.0509 2.55566C12.0664 2.57293 12.0779 2.59319 12.0851 2.61523C12.0923 2.63745 12.0954 2.66135 12.0929 2.68457L11.5656 7.69238C11.1022 7.99978 10.5586 8.16699 10.0001 8.16699C9.38711 8.16694 8.79039 7.96835 8.29995 7.60059C7.63642 7.10298 6.82955 6.83405 6.00015 6.83398C5.4366 6.83398 4.88397 6.95964 4.37906 7.19531L3.90738 2.68359C3.90503 2.66058 3.90708 2.63724 3.91421 2.61523C3.92143 2.59304 3.93375 2.57204 3.94937 2.55469C3.96487 2.53757 3.98395 2.52409 4.00503 2.51465L4.07339 2.5H11.9269Z" stroke="#A35D7A" stroke-linecap="round"/></g></svg>`;

const AMBIENT = `<svg preserveAspectRatio="none" overflow="visible" style="display: block;" width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg"><circle id="Ambient shape" cx="75" cy="75" r="75" fill="#F4DDE2" fill-opacity="0.121569"/></svg>`;

export function WaterGlassIllustration() {
  return <SvgXml xml={GLASS} width={64} height={76} />;
}

export function WaterGlassIcon() {
  return <SvgXml xml={ICON} width={16} height={16} />;
}

export function HydrationAmbient() {
  return <SvgXml xml={AMBIENT} width={150} height={150} />;
}
