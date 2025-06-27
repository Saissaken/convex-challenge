"use client";

import { useState } from "react";
import { CreateBattleModal } from "./create-battle-modal";

export const CreateBattleButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-colors flex items-center justify-center space-x-2"
      >
        <span>🔥</span>
        <span>New Battle</span>
      </button>

      {isModalOpen && <CreateBattleModal onClose={handleCloseModal} />}
    </>
  );
};
