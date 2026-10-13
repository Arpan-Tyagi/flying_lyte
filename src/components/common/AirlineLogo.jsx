import { useEffect, useState } from "react";
import { Plane } from "lucide-react";

const AirlineLogo = ({
  airlineCode,
  airlineName = "Airline",
  className = "",
}) => {
  const code = String(airlineCode || "")
    .trim()
    .toUpperCase();

  const [extension, setExtension] = useState("gif");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setExtension("gif");
    setFailed(false);
  }, [code]);

  const handleError = () => {
    if (extension === "gif") {
      setExtension("jpg");
      return;
    }

    setFailed(true);
  };

  if (!code || failed) {
    return (
      <div
        className={`grid place-items-center rounded-lg bg-white/10 text-[#E6B35C] ${className}`}
        title={airlineName}
        aria-label={`${airlineName} logo unavailable`}
      >
        <Plane size={18} />
      </div>
    );
  }

  return (
    <img
      src={`/images/airlines/${code}.${extension}`}
      alt={`${airlineName} logo`}
      title={airlineName}
      onError={handleError}
      loading="lazy"
      className={`object-contain ${className}`}
    />
  );
};

export default AirlineLogo;