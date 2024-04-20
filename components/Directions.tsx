import { CaretCircleDoubleDown, CaretCircleDoubleUp } from '@phosphor-icons/react'
import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

function Directions({isLoading, nearestUnidade, form } : {isLoading: boolean, nearestUnidade: any, form: any}) {

    const [isDirectionsVisible, setIsDirectionsVisible] = useState(false);
    const directionsRef = useRef<HTMLDivElement>(null); // Adiciona o tipo aqui

    const toggleDirections = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsDirectionsVisible(!isDirectionsVisible);
    };

    const getAtendimento = () => {
        switch(form.tipoAtendimento) {
            case '1':
                return 'Operacional';
            case '2':
                return 'Legalização de Imóveis';
            case '3':
                return 'Regularização de Piscina';
            case '4':
                return 'Postos FUNESBOM - Taxa de Incêndio';
            default:
                return '';
        }
    }


    useEffect(() => {
        const intervalId = setInterval(() => {
            const destinyElement = document.querySelector('button[data-leg-index="1"] .adp-text, div[data-leg-index="1"] .adp-text');
            if (destinyElement) {
                destinyElement.innerHTML = `Voce chegou na unidade <span style="font-weight: 800;">${" "}${nearestUnidade.nome}</span>`;
                clearInterval(intervalId);
            }
        }, 200);

        if (isDirectionsVisible && directionsRef.current) {
            directionsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        return () => clearInterval(intervalId);
    }, [isDirectionsVisible, isLoading]);

    return (
        <div ref={directionsRef}>
            <div className='md:hidden flex justify-center'>
                <button onClick={toggleDirections}
                        className="fixed w-full justify-center bottom-0 z-10 flex items-center gap-2 md:hidden bg-red-800 p-1 text-white">
                    <span>
                        {isDirectionsVisible ? 'Ocultar' : 'Exibir'} direções
                    </span>
                    {isDirectionsVisible ?
                        <CaretCircleDoubleUp size={26} />
                        :
                        <CaretCircleDoubleDown size={26} />
                    }
                </button>
            </div>
            {!isLoading &&
                <div className='shadow-md rounded-none' >
                    <div className="relative w-full">
                        <span  className="uppercase font-medium text-[.60rem] text-gray-900 
                        bg-white relative px-1 top-2.5 left-3 w-auto">
                            Unidade Responsável
                        </span>
                        <span  className="font-semibold border border-gray-900 text-gray-900 text-xs rounded-sm block w-full p-2">
                            {nearestUnidade ? nearestUnidade.nome : "..."}
                        </span>
                    </div>

                    <div className="relative w-full mb-2 ">
                        <span  className="uppercase font-medium text-[.60rem] text-gray-900 
                        bg-white relative px-1 top-2.5 left-3 w-auto">
                            Atendimento Selecionado
                        </span>
                        <span  className="font-semibold uppercase border border-gray-900 text-gray-900 text-xs rounded-sm block w-full p-2">
                            {getAtendimento()}
                        </span>
                    </div>
                </div>
            }

            <div className={`${isDirectionsVisible ? 'block' : 'hidden'} md:block`}>
                {isLoading ?
                    <div className="bg-white p-4 rounded-lg flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                        :
                        <div key={isLoading ? 'loading' : 'loaded'} id='directions-panel'
                             className='p-1 max-h-80 overflow-auto'></div>}
                </div>
        </div>
);
}

export default Directions