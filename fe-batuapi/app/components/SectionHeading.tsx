type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
};

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <div className={centered ? "text-center" : "text-left"}>
      <span className="inline-block rounded-full border border-ember-500/30 bg-ember-500/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.3em] text-ember-300">
        {eyebrow}
      </span>
      <h2 className="font-display text-glow-soft mt-5 text-3xl tracking-wide text-cream sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-4 max-w-2xl text-sm text-abyss-300 sm:text-base ${
            centered ? "mx-auto" : ""
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
