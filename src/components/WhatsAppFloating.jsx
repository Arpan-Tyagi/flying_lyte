import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

const WhatsAppFloating = () => {
  const phoneNumber = "919667455591";

  const openWhatsApp = () => {
    window.open(`https://wa.me/${phoneNumber}`, "_blank");
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="fixed bottom-3 right-3 z-50 sm:bottom-5 sm:right-5 md:bottom-6 md:right-6"
    >
      <button
        onClick={openWhatsApp}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-(--gold-soft) shadow-xl transition hover:bg-(--gold-main) active:bg-(--gold-main) sm:h-12 sm:w-12 md:h-14 md:w-14"
      >
        <MessageCircle className="h-5 w-5 text-white sm:h-6 sm:w-6" />
      </button>
    </motion.div>
  );
};

export default WhatsAppFloating;
