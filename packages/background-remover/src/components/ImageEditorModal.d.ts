import React from 'react';
interface ImageEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: File | null;
}
declare const ImageEditorModal: React.FC<ImageEditorModalProps>;
export default ImageEditorModal;
