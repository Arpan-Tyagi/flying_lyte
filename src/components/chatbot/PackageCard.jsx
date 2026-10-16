import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, CalendarDays, MapPin, Phone } from "lucide-react";
import { FLYINGLYTE_PHONE } from "./chatbotService";

const PackageCard = ({ item }) => {
    const navigate = useNavigate();
    const pkg = item?.package || item;
    if (!pkg) return null;

    const title = pkg.title || pkg.tour_name || "Travel Package";
    const destination =
        item?.destination || pkg.destination || pkg.Country_City_Multicity || "";
    const days = pkg.days;
    const nights = pkg.Number_of_nights ?? pkg.nights;
    const price = pkg.price == null ? null : Number(pkg.price);
    const image = pkg.images?.[0]?.image || pkg.image || null;

    const viewDetails = () => {
        if (pkg.slug) navigate(`/packages/${encodeURIComponent(pkg.slug)}`);
    };

    return (
        <article className="w-full min-w-0 overflow-hidden rounded-xl border border-[#E6B35C]/20 bg-[#06111d] p-2.5 text-white shadow-[0_8px_22px_rgba(0,0,0,0.2)] transition-colors hover:border-[#E6B35C]/45">
            <div className="flex min-w-0 gap-2.5">
                <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-white/5">
                    {image ? (
                        <img src={image} alt={title} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full items-center justify-center px-1 text-center text-[10px] text-gray-400">
                            FlyingLyte Travel
                        </div>
                    )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#E6B35C]">
                        FlyingLyte Travel
                    </span>
                    <h3 className="line-clamp-2 break-words text-xs font-bold leading-4 text-white">
                        {title}
                    </h3>
                    {destination && (
                        <div className="flex min-w-0 items-start gap-1 text-[10px] text-gray-400">
                            <MapPin size={11} className="mt-0.5 shrink-0 text-[#E6B35C]" />
                            <span className="line-clamp-1 min-w-0">{destination}</span>
                        </div>
                    )}
                    {(days != null || nights != null) && (
                        <div className="flex items-center gap-1 text-[10px] text-gray-300">
                            <CalendarDays size={11} className="shrink-0 text-[#E6B35C]" />
                            <span>{days ?? "—"} Days / {nights ?? "—"} Nights</span>
                        </div>
                    )}
                    {price !== null && Number.isFinite(price) && (
                        <div className="mt-auto text-sm font-extrabold text-[#E6B35C]">
                            ₹{price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-2.5 flex gap-2">
                <button
                    type="button"
                    onClick={viewDetails}
                    disabled={!pkg.slug}
                    className="flex min-h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#E6B35C] px-2 py-1.5 text-[11px] font-bold text-[#06111d] transition-colors hover:bg-[#F7CF75] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    View Details <ArrowUpRight size={14} />
                </button>
                <a
                    href={`tel:${FLYINGLYTE_PHONE}`}
                    aria-label={`Call FlyingLyte for details about ${title}`}
                    title="Call for more details"
                    className="flex h-9 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E6B35C]/40 bg-[#E6B35C]/10 text-[#E6B35C] hover:bg-[#E6B35C]/20"
                >
                    <Phone size={16} />
                </a>
            </div>
        </article>
    );
};

export default PackageCard;
