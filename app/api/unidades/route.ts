import {NextRequest, NextResponse} from "next/server";
import prisma from "../../../lib/db";

export async function GET(request: NextRequest, response: NextResponse){
    let unidades: any[] = [];
    try{
      const connected =  await prisma.$connect();
        // @ts-ignore
        if (!connected) {
            console.error("Database connection failed")
            await prisma.$disconnect();
        }

        unidades = await prisma.unidade.findMany({
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
    catch (e){
        console.error("Database connection failed aqui.....")
        await prisma.$disconnect();
    }
    //@ts-ignore
    return NextResponse.json(unidades)

}