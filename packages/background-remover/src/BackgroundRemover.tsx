
import React, { useState, useCallback, useEffect } from 'react';
import ImageEditorModal from './components/ImageEditorModal';

interface BackgroundRemoverProps {
  file: File;
  onClose: () => void;
}

const BackgroundRemover: React.FC<BackgroundRemoverProps> = ({ file, onClose }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  useEffect(() => {
    if (file) {
      setIsModalOpen(true);
    }
  }, [file]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    onClose();
  }, [onClose]);

  return (
      <ImageEditorModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        file={file}
      />
  );
};

export default BackgroundRemover;
