import {NextRequest, NextResponse} from "next/server";
import prisma from "../../../lib/db";

export async function GET(request: NextRequest, response: NextResponse){
    const unidades = await prisma.unidade.findMany({
        where: {
            NOT: {
                nome: {
                    contains: 'FUNESBOM',
                }
            },
            active: true
            
        },
        include: {
            unidade_tipo_fk: {
                include: {
                    tipo: true
                }
            }
        }
    })
    return NextResponse.json(unidades)
}