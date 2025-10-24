// src/types/create/index.ts

// --- HẰNG SỐ (CONSTANTS) ---
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const MIN_ELEMENT_WIDTH = 30;
export const MIN_ELEMENT_HEIGHT = 20;
export const ZOOM_STEP = 0.1;
export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 3.0;

// --- KIỂU DỮ LIỆU (TYPES & INTERFACES) ---

export interface SlideElementStyle {
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  borderRadius?: string; // Sử dụng string, ví dụ: '5px', '50%'
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  opacity?: number;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
}

export interface SlideElement {
  id: string;
  type: 'text' | 'image' | 'shape'; // Đơn giản hóa các loại
  x: number; y: number; width: number; height: number;
  content?: string; // Nội dung text hoặc Image data URL
  style: SlideElementStyle;
  isEditing?: boolean; // Chỉ dùng cho text
}

export interface Slide {
  id: string;
  elements: SlideElement[];
  backgroundColor: string;
}

export type InteractionState = 'idle' | 'draggingElement' | 'resizingElement';

export interface DragResizeInfo {
    startX: number; startY: number; // Vị trí chuột ban đầu (đã điều chỉnh theo zoom)
    initialX: number; initialY: number; // Vị trí element ban đầu
    initialW?: number; initialH?: number; // Kích thước element ban đầu (cho resize)
    handle?: string; // Handle resize nào đang được sử dụng
}

export type SidebarTab = 'elements' | 'text' | 'uploads';

export interface SaveOptions {
    title: string;
    topic: string;
    price: number;
    grade?: number;
}