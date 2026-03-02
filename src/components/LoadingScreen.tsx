export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-vexed-bg2">
      <div className="relative flex items-center justify-center">
        {/* Orbiting lightning bolt — tangent to the circle */}
        <div className="absolute h-28 w-28 animate-orbit">
          <svg className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-5" viewBox="0 0 24 14" fill="white" opacity="0.9">
            <polygon points="0,8 0,2 10,7 10,0 24,8 14,5 14,12" />
          </svg>
        </div>


        {/* Logo */}
        <img
          src="/logo512.png"
          alt="Vexed"
          className="h-14 w-14 rounded-xl"
        />
      </div>
    </div>
  )
}
