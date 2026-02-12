export const getCatalogClassDescription = (code: string) => {
    const map: Record<string, string> = {
        "3610": "Equipamento para impressão e reprodução",
        "6530": "Mobiliário e equipamentos hospitalares",
        "7021": "Processamento de dados",
        "7110": "Mobiliário para escritório",
        "Outros": "Itens Diversos"
    };
    return map[code] || "Classe de Material/Serviço";
};
