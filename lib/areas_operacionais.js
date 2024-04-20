import { pontoNoPoligono } from "./poligono.js";
import {nomeunidades} from './nomeunidades.js'

function getKML(url) {
    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.responseType = "document";
		
        xhr.open("GET", url);
        xhr.overrideMimeType("text/xml");

        xhr.onload = () => {
            if (xhr.readyState === xhr.DONE && xhr.status === 200) {
                resolve(xhr.responseXML);
            }
        };

        xhr.send();
    });
}

function getPlacemarkPolygonCoordinates(placemark) {
    let placemarkCoordinates = [];

    const polygons = placemark.getElementsByTagName('coordinates');

    for (let polygon of polygons) {
        const coordinatesText = polygon.innerHTML.trim();
        const coordinatesLines = coordinatesText.split(/\s/);
        const coordinates = coordinatesLines.map(line => {
            const [long, lat] = line.trim().split(',');
            return [parseFloat(lat), parseFloat(long)];
        });

        placemarkCoordinates.push(coordinates);
    }

    return placemarkCoordinates;
}

/**
 * @param {XMLDocument} kml 
 */
export async function getOperationalAreas(url) {
    try {
        const kml = await getKML(url);
        const polygonIndex = 0; //Colocar o ínice da cama
        const folders = kml.getElementsByTagName('Folder');
        const folderOperationalAreas = folders[polygonIndex];
        const placemarkOperationalAreas = folderOperationalAreas.getElementsByTagName('Placemark');

        let operationalAreas = [];

        for (let placemark of placemarkOperationalAreas) {
            const obm = placemark.getElementsByTagName('name')[0].innerHTML.trim();
            const polygons = getPlacemarkPolygonCoordinates(placemark);

            operationalAreas.push({
                obm: obm,
                poligonos: polygons
            });
        }

        return operationalAreas;
    } catch (error) {
        console.error('Error fetching operational areas:', error);
        return [];
    }
}

export class _operationalArea{
    #polygons = [];
    #validatePolygon(polygon){
        //validação de polígono
        return true;
    }

    constructor(nome){
        this.nome = nome;
    }

    addPolygon(polygon){
        if(!this.#validatePolygon(polygon)) return false;
        this.#polygons.push(polygon)
    }

    getPolygons(){
        return this.#polygons
    }

    isInsideOperationalArea(coords){
        for(const polygon of this.#polygons){
            if(pontoNoPoligono(coords, polygon)) return true;
        }

        return false;
    }
    
}
export class _cbmerjGeoService{
    /**
     * @type {_operationalArea[]}
     */
    #obms = [];

    
    constructor(operationalAreas){
        for(const operationalArea of operationalAreas){

            const obm = new _operationalArea(operationalArea.obm)

            for(const polygon of operationalArea.poligonos){
                obm.addPolygon(polygon)
            }

            this.#obms.push(obm)

        }
    }

    getOBMPelaCoordenada(coords){
        for(const obm of this.#obms){
            if(obm.isInsideOperationalArea(coords)) return nomeunidades[obm.nome];
        }

        return false
    }
}

