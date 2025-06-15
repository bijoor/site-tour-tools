import { TourData, ExportOptions, POI, PathSegment } from '../types';

export const exportTourData = (tourData: TourData, options: ExportOptions): string => {
  switch (options.format) {
    case 'json':
      return exportAsJSON(tourData, options);
    case 'svg':
      return exportAsSVG(tourData, options);
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
};

const exportAsJSON = (tourData: TourData, options: ExportOptions): string => {
  const data = { ...tourData };
  
  if (!options.includeMetadata) {
    data.pois = data.pois.map(poi => ({
      ...poi,
      metadata: undefined,
    }));
  }
  
  if (!options.includeBackground) {
    data.backgroundImage = {
      url: '',
      width: data.backgroundImage.width,
      height: data.backgroundImage.height,
    };
  }
  
  return JSON.stringify(data, null, options.compression ? 0 : 2);
};

const exportAsSVG = (tourData: TourData, options: ExportOptions): string => {
  const { backgroundImage, pois, paths } = tourData;
  const { width, height } = backgroundImage;
  
  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
  
  if (options.includeBackground && backgroundImage.url) {
    svg += `<image href="${backgroundImage.url}" width="${width}" height="${height}" />`;
  }
  
  svg += '<g id="paths">';
  for (const path of paths) {
    svg += pathToSVG(path);
  }
  svg += '</g>';
  
  svg += '<g id="pois">';
  for (const poi of pois) {
    svg += poiToSVG(poi);
  }
  svg += '</g>';
  
  svg += '</svg>';
  
  return svg;
};

const pathToSVG = (path: PathSegment): string => {
  if (path.points.length < 2) return '';
  
  const pathData = `M ${path.points[0].x} ${path.points[0].y} ` +
    path.points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  
  return `<path d="${pathData}" stroke="${path.color || '#000'}" stroke-width="${path.width || 2}" fill="none" stroke-dasharray="${getStrokeDasharray(path.style)}" />`;
};

const poiToSVG = (poi: POI): string => {
  const { position, label } = poi;
  return `<g>
    <circle cx="${position.x}" cy="${position.y}" r="8" fill="#ff6b6b" stroke="#fff" stroke-width="2" />
    <text x="${position.x}" y="${position.y - 15}" text-anchor="middle" font-size="12" fill="#333">${label}</text>
  </g>`;
};

const getStrokeDasharray = (style?: string): string => {
  switch (style) {
    case 'dashed':
      return '8,4';
    case 'dotted':
      return '2,2';
    default:
      return 'none';
  }
};

export const importTourData = (data: string, format: 'json' | 'svg'): TourData => {
  switch (format) {
    case 'json':
      return importFromJSON(data);
    case 'svg':
      throw new Error('SVG import not yet implemented');
    default:
      throw new Error(`Unsupported import format: ${format}`);
  }
};

const importFromJSON = (jsonData: string): TourData => {
  try {
    const data = JSON.parse(jsonData);
    validateTourData(data);
    return data;
  } catch (error) {
    throw new Error(`Invalid tour data: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const validateTourData = (data: any): void => {
  if (!data.id || typeof data.id !== 'string') {
    throw new Error('Tour data must have a valid id');
  }
  
  if (!data.name || typeof data.name !== 'string') {
    throw new Error('Tour data must have a valid name');
  }
  
  if (!data.backgroundImage || !data.backgroundImage.width || !data.backgroundImage.height) {
    throw new Error('Tour data must have valid background image dimensions');
  }
  
  if (!Array.isArray(data.pois)) {
    throw new Error('Tour data must have a pois array');
  }
  
  if (!Array.isArray(data.paths)) {
    throw new Error('Tour data must have a paths array');
  }
};

export const generateTourId = (): string => {
  return `tour_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generatePOIId = (): string => {
  return `poi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generatePathId = (): string => {
  return `path_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generatePointId = (): string => {
  return `point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};