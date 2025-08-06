import React from 'react';
import './../background-remover.css';
interface ImageEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: File | null;
}
declare const ImageEditorModal: React.FC<ImageEditorModalProps>;
export default ImageEditorModal;
