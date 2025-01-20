import { useState } from "react";
import { colord } from "colord";
import { Check, Copy, Pipette } from "lucide-react";

export default function App() {
  const [color, setColor] = useState<string>("#ffffff");
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState<"hex" | "rgb" | "hsl">("hex");
  const [copied, setCopied] = useState(false);

  const isEyeDropperSupported = (): boolean => "EyeDropper" in window;

  const resetState = () => {
    setError(null);
    setCopied(false);
  };

  const handleClick = async () => {
    resetState();
    if (!isEyeDropperSupported()) {
      alert("Your browser does not support the EyeDropper API.");
      return;
    }

    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      setColor(result.sRGBHex);
      setError(null);
    } catch (err) {
      setError("Failed to pick a color.");
      console.error(err);
    }
  };

  const getFormattedColor = (): string | null => {
    if (!color) return null;

    const parsedColor = colord(color);
    switch (format) {
      case "rgb":
        return parsedColor.toRgbString();
      case "hsl":
        return parsedColor.toHslString();
      default:
        return parsedColor.toHex();
    }
  };

  const copyToClipboard = async () => {
    try {
      if (color) {
        await navigator.clipboard.writeText(getFormattedColor() || "");
        setCopied(true);
      }
    } catch (err) {
      console.error("Failed to copy color:", err);
    }
  };

  return (
    <div className="flex flex-col w-[320px] items-center justify-center bg-white text-black dark:bg-[#212121] dark:text-white p-4">
      <h1 className="text-lg font-bold">ColorSnip</h1>

      <div className="mt-4 flex flex-col items-center gap-4">
        <div className="flex items-center">
          <Pipette
            onClick={handleClick}
            className="w-5 h-5 cursor-pointer hover:scale-125 transition-transform mr-4"
          />
          <div className="border border-[#595959] text-sm px-3 py-1 w-[220px] flex items-center justify-between rounded-sm">
            <p className="tracking-widest">{getFormattedColor()}</p>
            {copied ? (
              <Check size={16} />
            ) : (
              <Copy
                size={16}
                onClick={copyToClipboard}
                className="cursor-pointer hover:scale-110 transition-transform"
              />
            )}
          </div>
        </div>
        {error && <p className="text-red-500">{error}</p>}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div
          className="w-6 h-6 rounded-full"
          style={{ background: color }}
        ></div>
        <select
          id="format"
          value={format}
          onChange={(e) => (
            resetState(), setFormat(e.target.value as "hex" | "rgb" | "hsl")
          )}
          className="px-4 py-2 rounded-md bg-white dark:bg-[#212121] text-black dark:text-white focus:outline-none cursor-pointer"
        >
          <option value="hex">HEX</option>
          <option value="rgb">RGB</option>
          <option value="hsl">HSL</option>
        </select>
      </div>
    </div>
  );
}
