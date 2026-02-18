type BadgeProps = {
  text: string;
  bgColor: string; // hex like "#eb4b4b"
  topClass: string; // e.g. "top-[75px]"
};

export default function Badge({ text, bgColor, topClass }: BadgeProps) {
  return (
    <div
      className={`left-4 right-4 text-center text-sm rounded-full text-black absolute truncate ${topClass} py-1 font-medium`}
      style={{ backgroundColor: bgColor }}
      title={text}
    >
      {text}
    </div>
  );
}
