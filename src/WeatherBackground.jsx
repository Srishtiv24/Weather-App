import { useEffect, useRef } from "react";

function getRaindrops(canvas, count = 120) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    speed: 6 + Math.random() * 8,
    length: 12 + Math.random() * 18,
    opacity: 0.15 + Math.random() * 0.35,
  }));
}

function getSnowflakes(canvas, count = 80) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: 1.5 + Math.random() * 3,
    speed: 0.4 + Math.random() * 1.2,
    drift: (Math.random() - 0.5) * 0.5,
    opacity: 0.4 + Math.random() * 0.5,
  }));
}

function getStars(canvas, count = 140) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: 0.5 + Math.random() * 1.5,
    twinkleSpeed: 0.005 + Math.random() * 0.02,
    phase: Math.random() * Math.PI * 2,
  }));
}

function getClouds(canvas, count = 5) {
  return Array.from({ length: count }, (_, i) => ({
    x: (i / count) * canvas.width * 1.5,
    y: 30 + Math.random() * 120,
    speed: 0.15 + Math.random() * 0.25,
    scale: 0.6 + Math.random() * 0.8,
    opacity: 0.12 + Math.random() * 0.18,
  }));
}

function drawCloud(ctx, x, y, scale, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = "rgba(255,255,255,1)";
  ctx.beginPath();
  const s = scale * 60;
  ctx.arc(x, y, s * 0.5, 0, Math.PI * 2);
  ctx.arc(x + s * 0.6, y - s * 0.1, s * 0.4, 0, Math.PI * 2);
  ctx.arc(x + s * 1.1, y, s * 0.45, 0, Math.PI * 2);
  ctx.arc(x + s * 0.55, y + s * 0.3, s * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export default function WeatherBackground({ condition, temp, isNight }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);
  const frameRef = useRef(0);

  const type = getAnimationType(condition, temp, isNight);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles();
    };

    function initParticles() {
      if (type === "rain") particlesRef.current = getRaindrops(canvas);
      else if (type === "snow") particlesRef.current = getSnowflakes(canvas);
      else if (type === "night") particlesRef.current = getStars(canvas);
      else if (type === "clouds") particlesRef.current = getClouds(canvas);
      else particlesRef.current = [];
    }

    resize();
    window.addEventListener("resize", resize);

    function draw() {
      frameRef.current++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (type === "rain") {
        particlesRef.current.forEach((drop) => {
          ctx.save();
          ctx.globalAlpha = drop.opacity;
          ctx.strokeStyle = "rgba(174,214,241,1)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 2, drop.y + drop.length);
          ctx.stroke();
          ctx.restore();
          drop.y += drop.speed;
          drop.x -= 1.5;
          if (drop.y > canvas.height) {
            drop.y = -drop.length;
            drop.x = Math.random() * canvas.width;
          }
        });
      } else if (type === "snow") {
        particlesRef.current.forEach((flake) => {
          ctx.save();
          ctx.globalAlpha = flake.opacity;
          ctx.fillStyle = "rgba(255,255,255,1)";
          ctx.beginPath();
          ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          flake.y += flake.speed;
          flake.x += flake.drift;
          if (flake.y > canvas.height) {
            flake.y = -5;
            flake.x = Math.random() * canvas.width;
          }
        });
      } else if (type === "night") {
        particlesRef.current.forEach((star) => {
          star.phase += star.twinkleSpeed;
          const alpha = 0.3 + 0.5 * Math.abs(Math.sin(star.phase));
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = "rgba(255,255,255,1)";
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      } else if (type === "sun") {
        const cx = canvas.width * 0.8;
        const cy = canvas.height * 0.15;
        const t = frameRef.current * 0.012;
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2 + t;
          const inner = 45 + 4 * Math.sin(t * 2);
          const outer = 80 + 12 * Math.sin(t + i);
          ctx.save();
          ctx.globalAlpha = 0.06 + 0.03 * Math.sin(t + i);
          ctx.strokeStyle = "rgba(255,220,80,1)";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
          ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
          ctx.stroke();
          ctx.restore();
        }
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
        grad.addColorStop(0, "rgba(255,230,100,0.12)");
        grad.addColorStop(1, "rgba(255,180,50,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, 80, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === "clouds") {
        particlesRef.current.forEach((cloud) => {
          drawCloud(ctx, cloud.x, cloud.y, cloud.scale, cloud.opacity);
          cloud.x += cloud.speed;
          if (cloud.x > canvas.width + 200) cloud.x = -200;
        });
      } else if (type === "thunder") {
        if (frameRef.current % 180 === 0 || frameRef.current % 181 === 0) {
          ctx.save();
          ctx.globalAlpha = 0.08;
          ctx.fillStyle = "rgba(180,150,255,1)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.restore();
        }
        particlesRef.current.forEach((drop) => {
          ctx.save();
          ctx.globalAlpha = drop.opacity * 0.6;
          ctx.strokeStyle = "rgba(140,160,200,1)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 3, drop.y + drop.length);
          ctx.stroke();
          ctx.restore();
          drop.y += drop.speed * 1.4;
          drop.x -= 2;
          if (drop.y > canvas.height) {
            drop.y = -drop.length;
            drop.x = Math.random() * canvas.width;
          }
        });
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [type]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

function getAnimationType(condition, temp, isNight) {
  if (isNight) return "night";
  const c = (condition || "").toLowerCase();
  if (c.includes("thunder") || c.includes("storm")) return "thunder";
  if (c.includes("snow")) return "snow";
  if (c.includes("rain") || c.includes("drizzle")) return "rain";
  if (c.includes("cloud") || c.includes("overcast")) return "clouds";
  if (c.includes("fog") || c.includes("haze") || c.includes("mist")) return "clouds";
  if (temp >= 25) return "sun";
  return "clouds";
}
