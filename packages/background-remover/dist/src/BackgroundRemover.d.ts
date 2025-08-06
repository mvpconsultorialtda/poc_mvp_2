import React from 'react';
interface BackgroundRemoverProps {
    file: File | null;
    onClose: () => void;
}
declare const BackgroundRemover: React.FC<BackgroundRemoverProps>;
export default BackgroundRemover;
