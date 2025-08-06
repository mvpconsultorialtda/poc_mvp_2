import { jsx as _jsx } from "react/jsx-runtime";
import { useState, useCallback, useEffect } from 'react';
import ImageEditorModal from './components/ImageEditorModal';
const BackgroundRemover = ({ file, onClose }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    useEffect(() => {
        if (file) {
            setIsModalOpen(true);
        }
    }, [file]);
    const handleModalClose = useCallback(() => {
        setIsModalOpen(false);
        onClose();
    }, [onClose]);
    return (_jsx(ImageEditorModal, { isOpen: isModalOpen, onClose: handleModalClose, file: file }));
};
export default BackgroundRemover;
