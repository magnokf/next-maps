import React, {useEffect, useState} from 'react';
import {Loader} from "@googlemaps/js-api-loader";
import {getOperationalAreas, _cbmerjGeoService} from '../lib/areas_operacionais'
import axios from 'axios';

type MapType = google.maps.Map | null;

// @ts-ignore
function CustomMap({center, zoom, form, setNearestUnidade, isLoading, setIsLoading, setForm}) {
    const [map, setMap] = useState<MapType>(null);
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

    async function loadMap() {
        const googleMaps = google.maps;

        const {Map} = await googleMaps.importLibrary('maps') as google.maps.MapsLibrary;
        const map = new Map(document.getElementById('map') as HTMLElement, {
            center: {lat: parseFloat(center.lat as string), lng: parseFloat(center.lng as string)},
            zoom: zoom,
            mapId: 'CBMERJ_MAP_ID',
            mapTypeId: "terrain",
        });

        setMap(map);
    }

    async function getNearestUnidade(tipo: string) {
        setIsLoading(true);
        const response = await axios.get('/api/unidades');
        const data = await response.data;

        const unitsWithDistance = data.map((unit: { lat: string; lng: string; }) => ({
            ...unit,
            distance: google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng({lat: parseFloat(center.lat as string), lng: parseFloat(center.lng as string)}),
                new google.maps.LatLng({lat: parseFloat(unit.lat), lng: parseFloat(unit.lng)})
            ),
        })).sort((a: { distance: number; }, b: { distance: number; }) => a.distance - b.distance);

        let nearestUnidade = null;
        for (const element of unitsWithDistance) {
            const current = element;

            const hasTipo = current.unidade_tipo_fk?.some((fk: {
                tipo: { id: number, mostra_superior: boolean, tipo: string }
            }) => fk.tipo.id === parseInt(tipo) && fk.tipo.mostra_superior === false);

            if (hasTipo) {
                if (tipo === "1" && await isInsidePolygon(current)) {
                    nearestUnidade = current;
                    break;
                } else if (tipo !== "1") {
                    nearestUnidade = current;
                    break;
                }
            } else {
                const superiorUnidade = unitsWithDistance.find((unit: {
                    id: number;
                    unidade_tipo_fk: { tipo: { id: number, mostra_superior: boolean, tipo: string } }[]
                }) => unit.id === current.unidade_superior_id);
                const hasSuperiorTipo = superiorUnidade?.unidade_tipo_fk.some((fk: {
                    tipo: { id: number, mostra_superior: boolean, tipo: string }
                }) => fk.tipo.id === parseInt(tipo));

                if (hasSuperiorTipo) {
                    nearestUnidade = superiorUnidade;
                    break;
                }
            }
        }

        setIsLoading(false);

        if (nearestUnidade) {
            const unidadeCBMERJImg = document.createElement('img');
            unidadeCBMERJImg.src = '/images/marker_cbmerj.png';
            const markerViewWithText = new google.maps.marker.AdvancedMarkerElement({
                map,
                position: {lat: parseFloat(nearestUnidade.lat), lng: parseFloat(nearestUnidade.lng)},
                title: `${nearestUnidade.nome}`,
                content: unidadeCBMERJImg,
            });

            const infoWindow = new google.maps.InfoWindow({
                content: `${nearestUnidade.nome}`,
            });

            markerViewWithText.addListener('click', () => {
                infoWindow.open(map, markerViewWithText);
            });

        }

        return nearestUnidade;
    }

    async function isInsidePolygon(point: { lat: string; lng: string; }) {
        let areasPromise = getOperationalAreas("/OBM_CBMERJ.kml");
        let areas = await areasPromise;

        let cbmerjGeoService = new _cbmerjGeoService(areas);

        let originObm = cbmerjGeoService.getOBMPelaCoordenada([parseFloat(center.lat as string), parseFloat(center.lng as string)]);
        let pointObm = cbmerjGeoService.getOBMPelaCoordenada([parseFloat(point.lat), parseFloat(point.lng)]);

        return originObm === pointObm;
    }

    function traceRoute(unidade: { lat: string; lng: string; }) {
        const directionsService = new google.maps.DirectionsService();
        const request = {
            origin: {lat: parseFloat(center.lat as string), lng: parseFloat(center.lng as string)},
            destination: {lat: parseFloat(unidade.lat), lng: parseFloat(unidade.lng)},
            travelMode: form.travelMode as google.maps.TravelMode,
        };
        directionsService.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                if (directionsRenderer) {
                    directionsRenderer.setMap(null);
                    directionsRenderer.setPanel(null);
                }

                const newDirectionsRenderer = new google.maps.DirectionsRenderer({
                    map,
                    directions: result,
                    suppressMarkers: true,
                    panel: document.getElementById('directions-panel'),
                });

                setDirectionsRenderer(newDirectionsRenderer);
            }
        });
    }


    useEffect(() => {
        const loader = new Loader({
            apiKey: `${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
            version: "3.55",
        });


        loader.importLibrary('maps').then(() => {
            loadMap();

            const googleMaps = google.maps;
            // @ts-ignore

            setMap(map);

            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({location: {lat: center.lat, lng: center.lng}}, (results, status) => {
                if (status === "OK" && results?.[0]) {
                    setForm({...form, end: results[0]?.formatted_address});
                }
            });

            const directionsRenderer = new googleMaps.DirectionsRenderer();
            directionsRenderer.setMap(map);
        });

    }, [center, zoom]); // Only re-run the effect if center or zoom changes

    useEffect(() => {
        if (!map) return; // Ensure map is initialized

        const userMarker = async () => {
            await google.maps.importLibrary("marker").then(() => {
                const myPosition = createMarker();
                addMarkerListener(myPosition);
            });
        }

        const createMarker = () => {
            return new google.maps.marker.AdvancedMarkerElement({
                position: {lat: center.lat, lng: center.lng},
                map: map,
                title: 'Sua localização',
            });
        }

        const addMarkerListener = (marker: google.maps.MVCObject | google.maps.marker.AdvancedMarkerElement | null | undefined) => {
            // @ts-ignore
            marker.addListener('mouseover', () => {
                const infoWindow = new google.maps.InfoWindow({
                    content: 'Sua localização',
                });
                infoWindow.open(map, marker);
            });
        }

        userMarker();

        (async () => {
            const nearestUnidade = await getNearestUnidade(form.tipoAtendimento);
            if (nearestUnidade) {
                setNearestUnidade(nearestUnidade);
                traceRoute(nearestUnidade);
            }
        })();

    }, [map]); // This effect depends on the map being initialized

    return (
        <div>

            {isLoading ?
                (
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-4 rounded-lg flex items-center space-x-3">
                            <div
                                className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
                            <div>
                                <p className="text-gray-500">Buscando a unidade mais próxima...</p>
                                {form.tipoAtendimento == "1" && <p>Atendimento Operacional</p>}
                                {form.tipoAtendimento == "2" && <p>Legalização de Imóveis</p>}
                                {form.tipoAtendimento == "3" && <p>Regularização de Piscina</p>}
                                {form.tipoAtendimento == "4" && <p>Postos FUNESBOM - Taxa de Incêndio</p>}
                            </div>
                        </div>
                    </div>
                ) : ('')
            }
        </div>


    )
        ;
}

export default CustomMap;