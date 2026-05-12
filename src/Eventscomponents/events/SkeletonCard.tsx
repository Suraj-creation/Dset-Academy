// src/components/events/SkeletonCard.tsx

export default function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-[rgba(255,255,255,0.58)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(244,248,255,0.72))] shadow-[0_22px_60px_rgba(0,31,63,0.08)] backdrop-blur-[18px]">
      <div className="h-[240px] bg-[linear-gradient(90deg,rgba(233,238,246,0.85)_25%,rgba(247,250,255,0.95)_50%,rgba(233,238,246,0.85)_75%)] [background-size:200%_100%] [animation:shimmer_1.6s_linear_infinite]" />
      <div className="px-6 pb-7 pt-6">
        <div className="mb-[14px] h-3 w-[88px] rounded-full bg-[rgba(0,31,63,0.08)]" />
        <div className="mb-[10px] h-6 w-[72%] rounded-full bg-[rgba(0,31,63,0.11)]" />
        <div className="mb-2 h-[14px] w-[94%] rounded-full bg-[rgba(0,31,63,0.08)]" />
        <div className="h-[14px] w-[62%] rounded-full bg-[rgba(0,31,63,0.08)]" />
      </div>
    </div>
  );
}