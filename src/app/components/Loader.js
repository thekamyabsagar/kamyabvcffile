export default function Loader({ size = "12" }) {
  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full h-${size} w-${size} border-t-2 border-b-2 border-purple-500`}></div>
    </div>
  );
}