// GradientBackground — "Desert Horizon", made with the 21st.dev Gradient
// Builder and exported as live CSS (Copy-CSS background + soften-blur pass).
// Zero dependencies: one <div> that fills its parent. Drop it behind content:
// <div className="relative h-96"><GradientBackground className="absolute inset-0" /></div>
// Remix the source recipe (colors, mode, finish) in the editor:
// https://21st.dev/community/gradients/editor?from=ebbcf7d9-61c0-4cee-94d5-0331ec3e784a
export function GradientBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "100%",
        containerType: "size",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "-0.8cqmin",
          filter: "blur(0.4cqmin)",
          backgroundColor: "#7A4B3A",
          backgroundImage:
            "radial-gradient(150% 46.8% at 42.7% 6%, rgba(255, 241, 207, 0.92) 0%, rgba(255, 241, 207, 0) 51%), radial-gradient(150% 46.8% at 43.43% 33%, rgba(246, 193, 119, 0.92) 0%, rgba(246, 193, 119, 0) 51%), radial-gradient(150% 46.8% at 51.03% 67%, rgba(208, 139, 91, 0.92) 0%, rgba(208, 139, 91, 0) 51%), radial-gradient(150% 46.8% at 53.18% 94%, rgba(122, 75, 58, 0.92) 0%, rgba(122, 75, 58, 0) 51%)",
        }}
      />
    </div>
  )
}
