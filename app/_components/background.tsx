const Background = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-background" aria-hidden="true">
      {/* Faint radial brand-tinted glow, top-center */}
      <div className="absolute -top-32 left-1/2 h-[480px] w-[min(80vw,900px)] -translate-x-1/2 rounded-full bg-brand/5 blur-3xl" />
      {/* Ultra-faint grid, masked radially towards the top */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
    </div>
  );
};

export default Background;
