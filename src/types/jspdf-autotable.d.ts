declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  interface CellDef {
    content?: string | number;
    colSpan?: number;
    rowSpan?: number;
    styles?: Partial<Styles>;
  }

  interface RowInput {
    [key: string]: string | number | CellDef;
  }

  interface Styles {
    font?: string;
    fontStyle?: string;
    overflow?: 'linebreak' | 'ellipsize' | 'visible' | 'hidden';
    fillColor?: number | number[] | string | false;
    textColor?: number | number[] | string;
    cellPadding?: number | { top?: number; right?: number; bottom?: number; left?: number };
    fontSize?: number;
    cellWidth?: number | 'auto' | 'wrap';
    minCellWidth?: number;
    minCellHeight?: number;
    halign?: 'left' | 'center' | 'right' | 'justify';
    valign?: 'top' | 'middle' | 'bottom';
    lineColor?: number | number[] | string;
    lineWidth?: number;
  }

  interface UserOptions {
    head?: (string | CellDef)[][];
    body?: (string | number | CellDef)[][];
    foot?: (string | CellDef)[][];
    startY?: number;
    margin?: number | { top?: number; right?: number; bottom?: number; left?: number };
    pageBreak?: 'auto' | 'avoid' | 'always';
    rowPageBreak?: 'auto' | 'avoid';
    tableWidth?: number | 'auto' | 'wrap';
    showHead?: 'everyPage' | 'firstPage' | 'never';
    showFoot?: 'everyPage' | 'lastPage' | 'never';
    theme?: 'striped' | 'grid' | 'plain';
    styles?: Partial<Styles>;
    headStyles?: Partial<Styles>;
    bodyStyles?: Partial<Styles>;
    footStyles?: Partial<Styles>;
    alternateRowStyles?: Partial<Styles>;
    columnStyles?: { [key: string]: Partial<Styles> };
    didDrawCell?: (data: CellHookData) => void;
    didDrawPage?: (data: HookData) => void;
    willDrawCell?: (data: CellHookData) => void;
    willDrawPage?: (data: HookData) => void;
  }

  interface CellHookData {
    cell: {
      raw: string | number | CellDef;
      text: string[];
      x: number;
      y: number;
      width: number;
      height: number;
      styles: Styles;
    };
    row: {
      raw: RowInput;
      index: number;
    };
    column: {
      index: number;
      dataKey: string | number;
    };
    section: 'head' | 'body' | 'foot';
  }

  interface HookData {
    pageNumber: number;
    pageCount: number;
    settings: UserOptions;
    table: any;
    doc: jsPDF;
    cursor: { x: number; y: number };
  }

  export default function autoTable(doc: jsPDF, options: UserOptions): jsPDF;
}

// Extend jsPDF to include lastAutoTable property
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
    };
  }
}
