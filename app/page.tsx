'use client'
import React, {useEffect, useState} from 'react'
import {z} from 'zod'
import {Input} from '../components/ui/input'
import {Label} from '../components/ui/label'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '../components/ui/select'
import Image from 'next/image'
import CustomMap from '../components/CustomMap'
import Directions from '../components/Directions'
import {MagnifyingGlass, MapPin} from '@phosphor-icons/react'

// Define the schema for the form
const schema = z.object({
    end: z.string(),
    tipoAtendimento: z.string(),
    travelMode: z.string()
})

// Define the type for the form
type FormValues = z.infer<typeof schema>;

const Form = (props: { children: React.ReactNode, onSubmit: React.FormEventHandler<HTMLFormElement> }) => {
    const {onSubmit, ...otherProps} = props
    return <form className="space-y-3 px-2 md:px-4" onSubmit={onSubmit} {...otherProps} />
}


export default function Home() {
    const [mapPosition, setMapPosition] = useState({lat: 0, lng: 0})
    const [form, setForm] = useState<FormValues>({
        end: '',
        tipoAtendimento: '1',
        travelMode: 'DRIVING'
    })
    const [nearestUnidade, setNearestUnidade] = useState({lat: '', lng: ''})
    const [isLoading, setIsLoading] = useState(false)


    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const geocoder = new google.maps.Geocoder()

        geocoder.geocode({address: `${form.end}, RJ`}, (results, status) => {
            if (status === 'OK') {
                if (results?.[0]) {
                    setMapPosition({
                        lat: results[0].geometry.location.lat(),
                        lng: results[0].geometry.location.lng()
                    })
                } else {
                    alert('No results found.')
                }
            } else {
                alert('Geocode was not successful for the following reason: ' + status)
            }
        })

    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setForm({...form, end: event.target.value})
    }


    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            setMapPosition({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            })
        })
    }, [])
    // @ts-ignore
    return (
        <main>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <div>


                    <Form onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                        e.preventDefault()
                        handleSubmit(e)
                    }}>
                        <div className="mb-4 mt-2 flex justify-start">
                            <Image src="/images/onde_estamos.png" alt="Logo" width={300} height={150} priority={true}/>
                        </div>
                        <div>


                            <div>
                                <Label htmlFor="end">Seu endereço ou localização do imóvel:</Label>
                                <Input type="text" id="end" placeholder="Digite o endereço" value={form.end}
                                       onChange={handleChange} required/>

                            </div>
                            <div>
                                <Label htmlFor="tipoAtendimento">Selecione o tipo de atendimento desejado:</Label>
                                <Select value={form.tipoAtendimento}
                                        onValueChange={(value) => setForm({...form, tipoAtendimento: value})} required>
                                    <SelectTrigger className="w-full">
                                        {/*    default value 1*/}
                                        <SelectValue placeholder="Selecione o tipo de atendimento"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="1">Atendimento Operacional</SelectItem>
                                            <SelectItem value="2">Legalização de Imóveis</SelectItem>
                                            <SelectItem value="3">Regularização de Piscina</SelectItem>
                                            <SelectItem value="4">Postos FUNESBOM - Taxa de Incêndio</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="travelMode">Como será o seu deslocamento:</Label>
                                <Select value={form.travelMode}
                                        onValueChange={(value) => setForm({...form, travelMode: value})} required>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecione o tipo de deslocamento"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>

                                            <SelectItem value="DRIVING">Dirigindo</SelectItem>
                                            <SelectItem value="BICYCLING">De Bicicleta</SelectItem>
                                            <SelectItem value="TRANSIT">Por Transporte Público</SelectItem>
                                            <SelectItem value="WALKING">Caminhando</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>

                            </div>
                            <div>
                                <button
                                    type="submit"
                                    className="flex justify-center items-center mt-2 w-full hover:bg-blue-700 hover:text-gray-50 text-blue-700 border border-blue-700 font-bold py-2 px-4 rounded gap-x-2"
                                ><MagnifyingGlass size={26}/>
                                    Buscar
                                </button>
                            </div>


                        </div>
                        {!isLoading && (
                            <div>
                                <button
                                    type="button"
                                    className="mt-0 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex justify-center items-center gap-x-2"
                                    onClick={() => {
                                        const origin = encodeURIComponent(form.end)
                                        const destination = encodeURIComponent(`${nearestUnidade.lat},${nearestUnidade.lng}`)
                                        const mode = form.travelMode.toLowerCase()
                                        window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${mode}`, '_blank')
                                    }}
                                >
                                    <MapPin weight="bold" size={26}/>
                                    Abrir no Google Maps
                                </button>
                            </div>
                        )}
                        <div>
                            <Directions isLoading={isLoading} nearestUnidade={nearestUnidade} form={form}/>
                        </div>


                    </Form>

                </div>
                <div className="map-container lg:col-span-2 h-64 md:h-96 lg:h-screen border-t-4 md:border-0">
                    <div id='map' className='h-screen w-full'/>

                    <CustomMap center={mapPosition} zoom={14} form={form} setForm={setForm}
                               setNearestUnidade={setNearestUnidade}
                               isLoading={isLoading} setIsLoading={setIsLoading}/>


                    {/*    <CustomMap center={mapPosition} zoom={14} form={form} setForm={setForm}*/}
                    {/*               setNearestUnidade={setNearestUnidade}*/}
                    {/*               isLoading={isLoading} setIsLoading={setIsLoading}/>*/}


                </div>

            </div>


        </main>
    )
}