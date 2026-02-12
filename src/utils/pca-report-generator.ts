import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { MOCK_PCA_DATA, PCASecretaria } from "./mock-pca-data";

// Colors
const COLORS = {
    primary: "#0f172a", // Slate-900
    secondary: "#334155", // Slate-700
    accent: "#0ea5e9", // Sky-500
    bgLight: "#f8fafc", // Slate-50
    text: "#1e293b", // Slate-800
    textLight: "#64748b", // Slate-500
    white: "#ffffff",
    priority: {
        "Altíssima": "#ef4444", // Red-500
        "Alta": "#f97316", // Orange-500
        "Média": "#eab308", // Yellow-500
        "Baixa": "#22c55e"  // Green-500
    }
};

export const generatePCAReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;

    // --- 1. CAPA ---
    doc.setFillColor(COLORS.primary);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Logo Placeholder (White Circle)
    doc.setFillColor(COLORS.white);
    doc.circle(pageWidth / 2, 80, 20, "F");
    doc.setFontSize(20);
    doc.setTextColor(COLORS.primary);
    doc.text("EC", pageWidth / 2, 82, { align: "center" });

    // Titles
    doc.setTextColor(COLORS.white);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("PCA 2025", pageWidth / 2, 130, { align: "center" });

    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text("Consolidado por Unidade Gestora", pageWidth / 2, 140, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(COLORS.textLight);
    doc.text("Contrato: 2025.10.23.001-01", pageWidth / 2, 260, { align: "center" });
    doc.text("Expert Consultoria + Prefeitura Camocim", pageWidth / 2, 266, { align: "center" });

    // --- 2. DASHBOARD EXECUTIVO ---
    doc.addPage();

    // Header
    doc.setFontSize(18);
    doc.setTextColor(COLORS.primary);
    doc.setFont("helvetica", "bold");
    doc.text("📊 DASHBOARD EXECUTIVO", margin, 20);

    // Resumo Cards
    const cardWidth = (pageWidth - (margin * 2) - 10) / 3;
    const cardY = 30;

    drawSummaryCard(doc, margin, cardY, cardWidth, "Total de Itens", MOCK_PCA_DATA.quantidadeItensGeral.toString());
    drawSummaryCard(doc, margin + cardWidth + 5, cardY, cardWidth, "Valor Total Estimado", `R$ ${(MOCK_PCA_DATA.valorTotalGeral / 1000000).toFixed(1)} Mi`);
    drawSummaryCard(doc, margin + (cardWidth + 5) * 2, cardY, cardWidth, "Unidades Gestoras", MOCK_PCA_DATA.secretarias.length.toString());

    // Pie Chart (Manual Drawing for distribution)
    const pieX = 60;
    const pieY = 100;
    const pieRadius = 35;

    doc.setFontSize(14);
    doc.setTextColor(COLORS.secondary);
    doc.text("Distribuição Orçamentária", margin, 80);

    // Draw simplified pie chart segments (angles approximated for visual representation of mock data)
    // Security 48% (172 degrees), Education 12% (43 deg), Infra 6%...
    // Note: For a real chart we'd calculate start/end angles properly. 
    // Simplified vector drawing for demo:
    let startAngle = 0;
    MOCK_PCA_DATA.secretarias.forEach(sec => {
        // Calculate slice angle based on value (simplified to item count for visual variety if needed, or stick to value)
        const portion = sec.valorTotal / MOCK_PCA_DATA.valorTotalGeral;
        const angle = portion * 360;

        // Draw Arc (omitted complex path logic for stability, drawing Legend instead as primary visual)

        // Legend
        doc.setFillColor(sec.corGrafico);
        doc.rect(110, pieY - 30 + (MOCK_PCA_DATA.secretarias.indexOf(sec) * 12), 4, 4, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(COLORS.text);
        const label = `${sec.sigla} - ${(portion * 100).toFixed(1)}%`;
        doc.text(label, 116, pieY - 27 + (MOCK_PCA_DATA.secretarias.indexOf(sec) * 12));
    });

    // Since manual arc drawing in jspdf is verbose without a helper, let's draw a visual representation (Bar chart) instead which is cleaner
    drawBarChart(doc, margin, 180, pageWidth - (margin * 2), 60, MOCK_PCA_DATA.secretarias);

    // Priority Legend
    const legendY = 270;
    drawPriorityLegend(doc, margin, legendY);

    // --- 3. DETALHAMENTO POR SECRETARIA ---
    MOCK_PCA_DATA.secretarias.forEach(sec => {
        if (sec.itens.length === 0) return; // Skip empty ones

        doc.addPage();

        // Header Secretaria
        doc.setFillColor(COLORS.bgLight);
        doc.rect(0, 0, pageWidth, 30, "F");

        doc.setFontSize(16);
        doc.setTextColor(COLORS.primary);
        doc.setFont("helvetica", "bold");
        doc.text(`📦 ${sec.nome}`, margin, 20); // Icon + Name

        // Items
        let currentY = 40;

        sec.itens.forEach(item => {
            // Check for page break
            if (currentY > pageHeight - 50) {
                doc.addPage();
                currentY = 20;
            }

            // Card Container
            doc.setDrawColor(200, 200, 200);
            doc.setFillColor(COLORS.white);
            doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 40, 2, 2, "FD");

            // Priority Stripe
            doc.setFillColor(COLORS.priority[item.prioridade]);
            doc.rect(margin, currentY, 2, 40, "F");

            // Title / Description
            doc.setFontSize(12);
            doc.setTextColor(COLORS.text);
            doc.setFont("helvetica", "bold");
            doc.text(item.tipo === "IT" ? "💻" : item.tipo === "Obra" ? "🏗️" : "📦", margin + 5, currentY + 10);
            doc.text(item.descricao.substring(0, 65) + (item.descricao.length > 65 ? "..." : ""), margin + 15, currentY + 10);

            // Info Row
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(COLORS.textLight);

            const valorStr = item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            doc.text(`💰 ${valorStr}`, margin + 15, currentY + 20);
            doc.text(`⏱️ ${item.prazo}`, margin + 65, currentY + 20);

            // Priority Badge Text
            doc.setTextColor(COLORS.priority[item.prioridade]);
            doc.setFont("helvetica", "bold");
            doc.text(`🎯 ${item.prioridade}`, margin + 110, currentY + 20);

            // Justification (multiline)
            doc.setFontSize(9);
            doc.setTextColor(COLORS.secondary);
            doc.setFont("helvetica", "italic");
            doc.text(item.justificativa, margin + 15, currentY + 30, { maxWidth: pageWidth - (margin * 2) - 20 });

            currentY += 48; // Spacing for next card
        });
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(COLORS.textLight);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: "right" });
        doc.text(`Gerado em ${new Date().toLocaleDateString()}`, margin, pageHeight - 10);
    }

    doc.save("PCA_2025_Consolidado_Camocim.pdf");
};

function drawSummaryCard(doc: jsPDF, x: number, y: number, w: number, title: string, value: string) {
    doc.setFillColor(COLORS.bgLight);
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(x, y, w, 30, 2, 2, "FD");

    doc.setFontSize(10);
    doc.setTextColor(COLORS.textLight);
    doc.text(title, x + 10, y + 10);

    doc.setFontSize(14);
    doc.setTextColor(COLORS.primary);
    doc.setFont("helvetica", "bold");
    doc.text(value, x + 10, y + 22);
}

function drawBarChart(doc: jsPDF, x: number, y: number, w: number, h: number, data: PCASecretaria[]) {
    // Simple Horizontal Bars
    const maxVal = Math.max(...data.map(d => d.valorTotal));
    let curY = y;
    const barHeight = 8;
    const gap = 12;

    doc.setFontSize(12);
    doc.setTextColor(COLORS.primary);
    doc.text("Top 5 - Volume Orçamentário", x, y - 10);

    data.slice(0, 5).forEach(sec => {
        const barW = (sec.valorTotal / maxVal) * (w - 100); // Leave space for labels

        // Label
        doc.setFontSize(9);
        doc.setTextColor(COLORS.text);
        doc.text(sec.sigla, x, curY + 6);

        // Bar
        doc.setFillColor(sec.corGrafico);
        doc.roundedRect(x + 20, curY, barW, barHeight, 1, 1, "F");

        // Value Label
        const valStr = `R$ ${(sec.valorTotal / 1000000).toFixed(1)}M`;
        doc.setFontSize(8);
        doc.text(valStr, x + 20 + barW + 2, curY + 6);

        curY += gap;
    });
}

function drawPriorityLegend(doc: jsPDF, x: number, y: number) {
    const priorities = ["Altíssima", "Alta", "Média", "Baixa"];
    let curX = x;

    priorities.forEach(p => {
        doc.setFillColor(COLORS.priority[p as keyof typeof COLORS.priority]);
        doc.circle(curX, y, 3, "F");

        doc.setTextColor(COLORS.text);
        doc.setFontSize(9);
        doc.text(p, curX + 5, y + 3);

        curX += 40;
    });
}
