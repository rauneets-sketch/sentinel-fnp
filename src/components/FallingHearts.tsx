import { useEffect, useState } from "react";
import "./FallingHearts.css";

interface Heart {
  id: number;
  left: number;
  animationDuration: number;
  size: number;
  delay: number;
}

const FallingHearts = () => {
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [clickedHearts, setClickedHearts] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Create initial hearts
    const initialHearts: Heart[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 8 + Math.random() * 6,
      size: 15 + Math.random() * 25,
      delay: Math.random() * 8,
    }));
    setHearts(initialHearts);

    // Continuously add new hearts
    const interval = setInterval(() => {
      setHearts((prev) => {
        const newHeart: Heart = {
          id: Date.now(),
          left: Math.random() * 100,
          animationDuration: 8 + Math.random() * 6,
          size: 15 + Math.random() * 25,
          delay: 0,
        };
        return [...prev.slice(-20), newHeart]; // Keep max 20 hearts
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  const handleHeartClick = (heartId: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setClickedHearts((prev) => new Set(prev).add(heartId));
    
    // Remove the heart after animation
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== heartId));
      setClickedHearts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(heartId);
        return newSet;
      });
    }, 500);
  };

  return (
    <div className="falling-hearts-container">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className={`falling-heart ${clickedHearts.has(heart.id) ? "clicked" : ""}`}
          style={{
            left: `${heart.left}%`,
            animationDuration: `${heart.animationDuration}s`,
            animationDelay: `${heart.delay}s`,
            fontSize: `${heart.size}px`,
          }}
          onClick={(e) => handleHeartClick(heart.id, e)}
        >
          ❤️
        </div>
      ))}
    </div>
  );
};

export default FallingHearts;
