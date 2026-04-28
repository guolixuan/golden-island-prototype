/**
 * 黄金岛·五一全民挖金矿活动原型
 * 设计哲学：「黄金矿脉」国风游戏UI美学 - 参考截图高保真还原
 * 色彩：深红 #8B0000 + 金色 #FFD700 + 暗棕木纹底色 + 米白古典纸张
 * 动效：呼吸发光、金铲子飞溅、数字跳动、手指引导、跑马灯
 */

import { useState, useEffect, useRef } from "react";

// ===== 游戏状态类型 =====
type GameStep =
  | "lobby"
  | "activity_panel"
  | "miner_recommend"
  | "lobby_game"
  | "room_select"
  | "playing"
  | "victory"
  | "activity_shop";

// ===== 金铲子飞出动画组件 =====
function ShovelFlyAnimation({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1400);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 200 }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: "50%", top: "55%", fontSize: "36px",
            animation: `shovelFly${i} 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${(i - 1) * 0.12}s forwards`,
          }}
        >⛏️</div>
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={`spark-${i}`} className="absolute rounded-full"
          style={{
            left: "50%", top: "55%", width: "6px", height: "6px",
            background: i % 2 === 0 ? "#FFD700" : "#FF8C00",
            "--tx": `${(Math.random() - 0.5) * 200}px`,
            "--ty": `${-(Math.random() * 150 + 50)}px`,
            animation: `sparkle 1s ease-out ${i * 0.08}s forwards`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ===== Toast 组件 =====
function GameToast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="fixed z-[9999] px-6 py-3 rounded-xl font-bold text-lg"
      style={{
        left: "50%", bottom: "120px", transform: "translateX(-50%)",
        background: "linear-gradient(135deg, #1A4A00 0%, #2D7A00 100%)",
        border: "2px solid #4ADE80", color: "#DCFCE7",
        boxShadow: "0 8px 32px rgba(74, 222, 128, 0.4)",
        animation: "toastSlideUp 2.5s ease-out forwards", whiteSpace: "nowrap",
      }}
    >{message}</div>
  );
}

// ===== 步骤指示器 =====
function StepIndicator({ step }: { step: GameStep }) {
  const stepMap: Record<GameStep, { num: number; label: string }> = {
    lobby: { num: 1, label: "大厅 · 发现活动" },
    activity_panel: { num: 2, label: "活动面板 · 了解规则" },
    miner_recommend: { num: 2, label: "活动面板 · 矿工推荐" },
    lobby_game: { num: 3, label: "大厅 · 前往打牌" },
    room_select: { num: 3, label: "场次选择 · 三打哈" },
    playing: { num: 3, label: "牌局进行中..." },
    victory: { num: 4, label: "胜利结算 · 首次掉落" },
    activity_shop: { num: 5, label: "活动商店 · 完成兑换" },
  };
  const info = stepMap[step];
  return (
    <div className="absolute top-4 left-1/2 z-50 step-indicator" style={{ transform: "translateX(-50%)" }}>
      Step {info.num}/5 · {info.label}
    </div>
  );
}

// ===== 跑马灯组件 =====
const MARQUEE_MESSAGES = [
  "🔊 恭喜玩家 [李大嘴***] 成功兑换了【50元话费卡】！",
  "🔊 恭喜玩家 [张三丰***] 成功兑换了【五一劳模绝版头像框】！",
  "🔊 恭喜玩家 [王小明***] 成功兑换了【5000万悟性】！",
  "🔊 恭喜玩家 [赵大宝***] 成功兑换了【记牌器(1天)】！",
  "🔊 恭喜玩家 [孙悟空***] 成功兑换了【50元话费卡】！",
];

function MarqueeBanner() {
  const [msgIdx, setMsgIdx] = useState(0);
  const [offset, setOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const SPEED = 60; // px/s

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const textWidth = container.scrollWidth;
    const containerWidth = container.parentElement?.clientWidth || 400;
    let pos = containerWidth;

    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = (ts - startRef.current) / 1000;
      pos = containerWidth - elapsed * SPEED;
      if (pos < -textWidth) {
        pos = containerWidth;
        startRef.current = ts;
        setMsgIdx((i) => (i + 1) % MARQUEE_MESSAGES.length);
      }
      setOffset(pos);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [msgIdx]);

  return (
    <div style={{ overflow: "hidden", flex: 1, position: "relative" }}>
      <div
        ref={containerRef}
        style={{
          position: "absolute", whiteSpace: "nowrap",
          transform: `translateX(${offset}px)`,
          color: "#FFE566", fontSize: "13px", fontWeight: 600,
          textShadow: "0 1px 3px rgba(0,0,0,0.8)",
          lineHeight: "28px",
        }}
      >
        {MARQUEE_MESSAGES[msgIdx]}
      </div>
    </div>
  );
}

// ===== 奖品卡片（仿古纸张风格）=====
interface PrizeCardProps {
  icon: React.ReactNode;
  name: string;
  sub: string;
  cost: number;
  shovelCount: number;
  canExchange: boolean;
  isExchanged?: boolean;
  badge?: string;
  badgeColor?: string;
  limitText?: string;
  onExchange?: () => void;
  tall?: boolean;
}

function PrizeCard({ icon, name, sub, cost, shovelCount, canExchange, isExchanged, badge, badgeColor, limitText, onExchange, tall }: PrizeCardProps) {
  const canClick = canExchange && shovelCount >= cost && !isExchanged;
  return (
    <div style={{
      background: "linear-gradient(180deg, #FFF8E8 0%, #F5E6C8 60%, #EDD9A3 100%)",
      border: `2px solid ${canClick ? "#CC8800" : "#B8965A"}`,
      borderRadius: "10px",
      padding: "10px 8px 8px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      position: "relative",
      boxShadow: canClick
        ? "0 0 16px rgba(255,200,0,0.5), inset 0 1px 0 rgba(255,255,255,0.8), 2px 4px 8px rgba(0,0,0,0.4)"
        : "inset 0 1px 0 rgba(255,255,255,0.8), 2px 4px 8px rgba(0,0,0,0.4)",
      flex: "0 0 auto",
      transition: "all 0.3s ease",
      overflow: "hidden",
    }}>
      {/* 纸张纹理叠加 */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "8px",
        background: "repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(180,140,60,0.06) 18px, rgba(180,140,60,0.06) 19px)",
        pointerEvents: "none",
      }} />

      {/* 绝版/限定角标 */}
      {badge && (
        <div style={{
          position: "absolute", top: 0, right: 0,
          background: badgeColor || "linear-gradient(135deg, #CC2200 0%, #FF4400 100%)",
          color: "#FFF", fontSize: "10px", fontWeight: 800,
          padding: "3px 8px 3px 12px",
          borderRadius: "0 8px 0 12px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
          whiteSpace: "nowrap",
          zIndex: 2,
        }}>{badge}</div>
      )}

      {/* 图标区 */}
      <div style={{
        fontSize: tall ? "52px" : "40px",
        marginBottom: "6px",
        marginTop: badge ? "14px" : "4px",
        filter: isExchanged ? "grayscale(1) opacity(0.5)" : "none",
        lineHeight: 1,
      }}>{icon}</div>

      {/* 名称 */}
      <div style={{
        fontSize: "13px", fontWeight: 800,
        color: isExchanged ? "#999" : "#5A2D00",
        textAlign: "center", lineHeight: 1.3,
        marginBottom: "3px",
        textShadow: "0 1px 0 rgba(255,255,255,0.6)",
      }}>{name}</div>

      {/* 副文字 */}
      <div style={{
        fontSize: "11px", color: isExchanged ? "#BBB" : "#8B5A00",
        textAlign: "center", marginBottom: "6px", lineHeight: 1.3,
      }}>{sub}</div>

      {/* 限购文字 */}
      {limitText && (
        <div style={{
          fontSize: "11px", color: "#AA6600",
          marginBottom: "4px", fontWeight: 600,
        }}>{limitText}</div>
      )}

      {/* 需求铲子 */}
      <div style={{
        background: isExchanged ? "rgba(150,150,150,0.2)" : "rgba(139,90,0,0.15)",
        border: `1px solid ${isExchanged ? "#CCC" : "#B8965A"}`,
        borderRadius: "12px",
        padding: "3px 10px",
        fontSize: "12px",
        color: isExchanged ? "#AAA" : "#6B3A00",
        fontWeight: 700,
        marginBottom: "8px",
        whiteSpace: "nowrap",
      }}>需求：{cost}矿子</div>

      {/* 兑换按钮 */}
      <button
        disabled={!canClick}
        onClick={onExchange}
        style={{
          width: "100%",
          padding: "7px 0",
          borderRadius: "6px",
          fontSize: "13px",
          fontWeight: 800,
          border: "none",
          cursor: canClick ? "pointer" : "not-allowed",
          background: isExchanged
            ? "rgba(150,150,150,0.3)"
            : canClick
              ? "linear-gradient(180deg, #FF6B35 0%, #CC2200 60%, #991A00 100%)"
              : "rgba(150,150,150,0.3)",
          color: isExchanged ? "#999" : canClick ? "#FFF8DC" : "#888",
          boxShadow: canClick ? "0 3px 8px rgba(180,30,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)" : "none",
          textShadow: canClick ? "0 1px 2px rgba(0,0,0,0.6)" : "none",
          transition: "all 0.3s ease",
          animation: canClick ? "btnPulse 1.5s ease-in-out infinite" : "none",
        }}
      >
        {isExchanged ? "已兑换" : "兑换"}
      </button>
    </div>
  );
}

// ===== 活动面板主体（新版横屏全屏）=====
interface ActivityPanelProps {
  shovelCount: number;
  exchanged: boolean;
  onBack: () => void;
  onGoPlay: () => void;
  onExchange: () => void;
  showRules?: boolean;
  onShowRules?: () => void;
  onHideRules?: () => void;
}

function ActivityPanel({ shovelCount, exchanged, onBack, onGoPlay, onExchange, showRules, onShowRules, onHideRules }: ActivityPanelProps) {
  const [countdown] = useState({ days: 4, hours: 12, mins: 33 });
  const progressPct = Math.min((shovelCount / 100) * 100, 100);

  return (
    <div style={{
      position: "relative",
      width: "fit-content", minWidth: "600px", height: "auto",
      background: "radial-gradient(ellipse at 50% 0%, #6B1A00 0%, #3D0D00 40%, #1A0500 100%)",
      display: "flex", flexDirection: "column",
      fontFamily: '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif',
      borderRadius: "14px",
      border: "2px solid rgba(255,215,0,0.5)",
      boxShadow: "0 8px 48px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,165,0,0.15)",
      overflow: "hidden",
    }}>
      {/* 顶部金色装饰线 */}
      <div style={{
        height: "3px",
        background: "linear-gradient(90deg, transparent 0%, #8B6914 20%, #FFD700 50%, #8B6914 80%, transparent 100%)",
      }} />

      {/* ===== 顶部标题栏 ===== */}
      <div style={{
        position: "relative",
        padding: "10px 16px 8px",
        background: "linear-gradient(180deg, rgba(139,26,0,0.8) 0%, transparent 100%)",
        flexShrink: 0,
      }}>
        {/* 金币装饰 - 左 */}
        <div style={{ position: "absolute", left: "80px", top: "6px", fontSize: "22px", opacity: 0.7, animation: "floatUpDown 3s ease-in-out infinite" }}>🪙</div>
        <div style={{ position: "absolute", left: "120px", top: "18px", fontSize: "16px", opacity: 0.5, animation: "floatUpDown 3s ease-in-out 0.5s infinite" }}>🪙</div>
        {/* 金币装饰 - 右 */}
        <div style={{ position: "absolute", right: "80px", top: "6px", fontSize: "22px", opacity: 0.7, animation: "floatUpDown 3s ease-in-out 1s infinite" }}>🪙</div>
        <div style={{ position: "absolute", right: "120px", top: "18px", fontSize: "16px", opacity: 0.5, animation: "floatUpDown 3s ease-in-out 1.5s infinite" }}>🪙</div>

        {/* 返回按钮 */}
        <button onClick={onBack} style={{
          position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
          background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
          border: "1px solid rgba(255,215,0,0.4)", borderRadius: "20px",
          color: "#FFD700", fontSize: "13px", fontWeight: 700,
          padding: "6px 14px", whiteSpace: "nowrap",
          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
        }}>◀ 返回</button>

        {/* 主标题 */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: "24px", fontWeight: 900, letterSpacing: "3px",
            background: "linear-gradient(180deg, #FFF8DC 0%, #FFD700 40%, #FF8C00 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            filter: "drop-shadow(0 2px 6px rgba(255,140,0,0.6))",
            lineHeight: 1.2,
          }}>五一狂欢·全民挖金矿</div>
          <div style={{ fontSize: "12px", color: "#FFA07A", marginTop: "3px", fontWeight: 600 }}>
            活动结束：{countdown.days}天{countdown.hours}小时{countdown.mins}分
          </div>
        </div>

        {/* 规则按钮 */}
        <button onClick={onShowRules} style={{
          position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
          width: "44px", height: "44px", borderRadius: "50%",
          background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
          border: "1px solid rgba(255,215,0,0.4)",
          color: "#FFD700", fontSize: "11px", fontWeight: 700,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: "1px", boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
        }}>
          <span style={{ fontSize: "18px" }}>📋</span>
          <span style={{ fontSize: "10px" }}>规则</span>
        </button>

      </div>

      {/* ===== 资产栏 ===== */}
      <div style={{
        margin: "0 12px 8px",
        background: "linear-gradient(180deg, rgba(80,20,0,0.9) 0%, rgba(50,10,0,0.95) 100%)",
        border: "1px solid rgba(139,105,20,0.6)",
        borderRadius: "10px",
        padding: "10px 14px",
        display: "flex", alignItems: "center", gap: "12px",
        boxShadow: "inset 0 1px 0 rgba(255,215,0,0.1), 0 2px 8px rgba(0,0,0,0.4)",
        flexShrink: 0,
      }}>
        {/* 我的金铲子 */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <span style={{ fontSize: "13px", color: "#CCA050", fontWeight: 600, whiteSpace: "nowrap" }}>我的金铲子</span>
          <span style={{ fontSize: "22px", filter: "drop-shadow(0 0 6px #FFD700)" }}>⛏️</span>
          <span style={{
            fontSize: "26px", fontWeight: 900, color: "#FFD700", fontFamily: "monospace",
            textShadow: "0 0 12px rgba(255,215,0,0.8)",
            animation: shovelCount > 0 ? "numberPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both" : "none",
          }}>{shovelCount}</span>
        </div>

        {/* 分隔线 */}
        <div style={{ width: "1px", height: "36px", background: "rgba(139,105,20,0.4)", flexShrink: 0 }} />

        {/* 今日进度 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "11px", color: "#CCA050", marginBottom: "5px", fontWeight: 600 }}>
            每日进度 {shovelCount}
          </div>
          <div style={{
            height: "12px", background: "rgba(0,0,0,0.5)",
            borderRadius: "6px", border: "1px solid rgba(139,105,20,0.4)",
            overflow: "hidden", position: "relative",
          }}>
            <div style={{
              height: "100%", width: `${progressPct}%`,
              background: progressPct > 0
                ? "linear-gradient(90deg, #FFD700 0%, #FF8C00 60%, #FF4500 100%)"
                : "transparent",
              borderRadius: "6px",
              boxShadow: progressPct > 0 ? "0 0 8px rgba(255,215,0,0.7)" : "none",
              transition: "width 0.8s ease",
            }} />
            {[20, 40, 60, 80].map(p => (
              <div key={p} style={{
                position: "absolute", top: 0, bottom: 0,
                left: `${p}%`, width: "1px",
                background: "rgba(255,255,255,0.15)",
              }} />
            ))}
          </div>
          {/* 里程碑标签 */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3px" }}>
            {["0矿", "50矿", "100矿", "200矿", "1400矿"].map(label => (
              <span key={label} style={{ fontSize: "9px", color: "#CCA050" }}>{label}</span>
            ))}
          </div>
        </div>

        {/* 分隔线 */}
        <div style={{ width: "1px", height: "36px", background: "rgba(139,105,20,0.4)", flexShrink: 0 }} />

        {/* 去打牌按钮 */}
        <button
          onClick={onGoPlay}
          style={{
            flexShrink: 0,
            background: "linear-gradient(180deg, #FFE566 0%, #FFD700 40%, #CC9900 100%)",
            border: "2px solid #8B6914",
            borderRadius: "8px",
            color: "#3D1A0A", fontSize: "14px", fontWeight: 800,
            padding: "10px 16px", whiteSpace: "nowrap",
            boxShadow: "0 4px 12px rgba(255,165,0,0.5), inset 0 1px 0 rgba(255,255,255,0.5)",
            textShadow: "0 1px 0 rgba(255,255,255,0.4)",
            animation: "btnPulse 1.5s ease-in-out infinite",
          }}
        >
          去打牌赚铲子 &gt;
        </button>
      </div>

      {/* ===== 奖品区域（两列）===== */}
      <div style={{
        margin: "0 12px 10px", display: "flex", gap: "10px",
      }}>
        {/* ---- 左半区：限量大奖 ---- */}
        <div style={{
          display: "flex", flexDirection: "column",
          background: "rgba(0,0,0,0.25)",
          border: "1px solid rgba(139,105,20,0.5)",
          borderRadius: "10px",
          padding: "8px 10px",
        }}>
          {/* 区域标题 */}
          <div style={{
            fontSize: "13px", fontWeight: 800, color: "#FFD700",
            marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px",
            textShadow: "0 1px 4px rgba(0,0,0,0.8)",
          }}>
            <span>💎</span>
            <span>【限量金铲子】</span>
            <span style={{ fontSize: "11px", color: "#CCA050", fontWeight: 600 }}>（先到先得）</span>
          </div>

          {/* 两张竖向奖品卡片 */}
          <div style={{ display: "flex", gap: "8px" }}>
            <PrizeCard
              icon={<div style={{
                width: "64px", height: "44px",
                background: "linear-gradient(135deg, #FFD700 0%, #FF8C00 50%, #CC6600 100%)",
                borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px", fontWeight: 900, color: "#FFF",
                textShadow: "0 2px 4px rgba(0,0,0,0.6)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
              }}>50元</div>}
              name="50元话费卡"
              sub="全服限量：100份 / 利20万"
              cost={500}
              shovelCount={shovelCount}
              canExchange={false}
              badge="兑完即止"
              badgeColor="linear-gradient(135deg, #CC2200 0%, #FF4400 100%)"
              onExchange={onExchange}
              tall
            />
            <PrizeCard
              icon={<div style={{
                width: "56px", height: "56px",
                background: "radial-gradient(circle, #8B6914 0%, #5A3A00 60%, #3D1A00 100%)",
                borderRadius: "50%",
                border: "3px solid #FFD700",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "28px",
                boxShadow: "0 0 12px rgba(255,215,0,0.5)",
              }}>🖼️</div>}
              name={`"五一劳模"绝版头像框`}
              sub="全服限量：0/1"
              cost={800}
              shovelCount={shovelCount}
              canExchange={false}
              badge="绝版限定"
              badgeColor="linear-gradient(135deg, #8B0066 0%, #CC0099 100%)"
              onExchange={onExchange}
              tall
            />
          </div>
        </div>

        {/* ---- 右半区：实用道具 ---- */}
        <div style={{
          display: "flex", flexDirection: "column",
          background: "rgba(0,0,0,0.25)",
          border: "1px solid rgba(139,105,20,0.5)",
          borderRadius: "10px",
          padding: "8px 10px",
        }}>
          {/* 区域标题 */}
          <div style={{
            fontSize: "13px", fontWeight: 800, color: "#FFD700",
            marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px",
            textShadow: "0 1px 4px rgba(0,0,0,0.8)",
          }}>
            <span>🎁</span>
            <span>【实用道具】</span>
            <span style={{ fontSize: "11px", color: "#CCA050", fontWeight: 600 }}>（每日刷新）</span>
          </div>

          {/* 三张小型奖品卡片 */}
          <div style={{ display: "flex", gap: "8px" }}>
            {/* 记牌器 */}
            <PrizeCard
              icon={<div style={{
                width: "52px", height: "52px",
                background: "linear-gradient(135deg, #4A8B6A 0%, #2D6B4A 100%)",
                borderRadius: "8px",
                border: "2px solid #8B6914",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", fontWeight: 800, color: "#FFF8DC",
                textAlign: "center", lineHeight: 1.2,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
              }}>记牌<br/>器</div>}
              name="记牌器(1天)"
              sub=""
              cost={10}
              shovelCount={shovelCount}
              canExchange={false}
              limitText="剩余：0/1"
              onExchange={onExchange}
            />
            {/* 初级场门票 */}
            <PrizeCard
              icon={<div style={{
                width: "52px", height: "44px",
                background: "linear-gradient(135deg, #8B6914 0%, #CC9900 50%, #8B6914 100%)",
                borderRadius: "6px",
                border: "1px solid #FFD700",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "10px", fontWeight: 800, color: "#FFF8DC",
                textAlign: "center", lineHeight: 1.3,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
              }}>初级场<br/>门票</div>}
              name="初级场门票"
              sub=""
              cost={80}
              shovelCount={shovelCount}
              canExchange={false}
              limitText="今日限量：0/1"
              onExchange={onExchange}
            />
            {/* 破产救济卡 */}
            <PrizeCard
              icon={<div style={{
                width: "52px", height: "52px",
                background: "linear-gradient(135deg, #8B0000 0%, #CC2200 50%, #8B0000 100%)",
                borderRadius: "8px",
                border: "2px solid #FFD700",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px", fontWeight: 900, color: "#FFD700",
                textShadow: "0 0 8px rgba(255,215,0,0.8)",
              }}>破</div>}
              name="破产救济卡"
              sub=""
              cost={80}
              shovelCount={shovelCount}
              canExchange={false}
              limitText="今日限量：0/1"
              onExchange={onExchange}
            />
          </div>
        </div>
      </div>

      {/* ===== 底部区域：跑马灯 + VIP浮层 ===== */}
      <div style={{
        margin: "8px 12px 10px",
        display: "flex", gap: "10px", alignItems: "stretch",
        flexShrink: 0,
      }}>
        {/* 跑马灯 */}
        <div style={{
          flex: 1,
          background: "rgba(0,0,0,0.5)",
          border: "1px solid rgba(139,105,20,0.4)",
          borderRadius: "8px",
          padding: "0 12px",
          height: "28px",
          display: "flex", alignItems: "center", gap: "8px",
          overflow: "hidden",
        }}>
          <span style={{ fontSize: "16px", flexShrink: 0 }}>📢</span>
          <MarqueeBanner />
          <span style={{ fontSize: "16px", flexShrink: 0 }}>📢</span>
        </div>

      </div>

      {/* 底部金色装饰线 */}
      <div style={{
        height: "3px",
        background: "linear-gradient(90deg, transparent 0%, #8B6914 20%, #FFD700 50%, #8B6914 80%, transparent 100%)",
      }} />

      {/* 规则弹窗 */}
      {showRules && (
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 100,
        }} onClick={onHideRules}>
          <div
            className="game-panel animate-modal-in"
            style={{ width: "85%", maxWidth: "360px", padding: "0", overflow: "hidden" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              background: "linear-gradient(180deg, #8B0000 0%, #5A0000 100%)",
              borderBottom: "2px solid #8B6914",
              padding: "12px 16px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#FFD700" }}>📋 活动规则</div>
              <button onClick={onHideRules} style={{
                background: "rgba(0,0,0,0.4)", border: "1px solid #666",
                borderRadius: "50%", width: "26px", height: "26px",
                color: "#CCC", fontSize: "16px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>×</button>
            </div>
            <div style={{ padding: "16px", fontSize: "13px", color: "#CCA050", lineHeight: 2 }}>
              <div style={{ color: "#FFD700", fontWeight: 700, marginBottom: "8px" }}>🪙 铲子获取方式</div>
              <div>· 五一期间每局牌局均可随机掉落金铲子</div>
              <div>· 初级高手场掉落倍率 <span style={{ color: "#FF8C00", fontWeight: 700 }}>×3</span></div>
              <div>· 每日最多累积 100 把（开通矿工卡提升至400）</div>
              <div style={{ color: "#FFD700", fontWeight: 700, margin: "8px 0" }}>🎁 兑换规则</div>
              <div>· 限量大奖先到先得，兑完即止</div>
              <div>· 实用道具每日0点刷新，限购数量重置</div>
              <div>· 活动结束后未使用铲子自动清零</div>
              <div style={{ color: "#FFD700", fontWeight: 700, margin: "8px 0" }}>⚠️ 注意事项</div>
              <div>· 每个账号限参与一次限量大奖兑换</div>
              <div>· 最终解释权归黄金岛游戏官方所有</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== 活动商店（Step 5，有3铲子，新手礼包可兑换）=====
interface ActivityShopProps {
  shovelCount: number;
  exchanged: boolean;
  onBack: () => void;
  onGoPlay: () => void;
  onExchange: () => void;
  onReturnLobby: () => void;
  showRules?: boolean;
  onShowRules?: () => void;
  onHideRules?: () => void;
}

function ActivityShop({ shovelCount, exchanged, onBack, onGoPlay, onExchange, onReturnLobby, showRules, onShowRules, onHideRules }: ActivityShopProps) {
  const progressPct = Math.min((shovelCount / 100) * 100, 100);

  return (
    <div style={{
      position: "relative",
      width: "fit-content", minWidth: "600px", height: "auto",
      background: "radial-gradient(ellipse at 50% 0%, #6B1A00 0%, #3D0D00 40%, #1A0500 100%)",
      display: "flex", flexDirection: "column",
      fontFamily: '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif',
      borderRadius: "14px",
      border: "2px solid rgba(255,215,0,0.5)",
      boxShadow: "0 8px 48px rgba(0,0,0,0.85)",
      overflow: "hidden",
    }}>
      {/* 顶部金色装饰线 */}
      <div style={{ height: "3px", background: "linear-gradient(90deg, transparent 0%, #8B6914 20%, #FFD700 50%, #8B6914 80%, transparent 100%)" }} />

      {/* ===== 顶部标题栏 ===== */}
      <div style={{
        position: "relative", padding: "10px 16px 8px",
        background: "linear-gradient(180deg, rgba(139,26,0,0.8) 0%, transparent 100%)",
        flexShrink: 0,
      }}>
        <div style={{ position: "absolute", left: "80px", top: "6px", fontSize: "22px", opacity: 0.7, animation: "floatUpDown 3s ease-in-out infinite" }}>🪙</div>
        <div style={{ position: "absolute", right: "80px", top: "6px", fontSize: "22px", opacity: 0.7, animation: "floatUpDown 3s ease-in-out 1s infinite" }}>🪙</div>

        <button onClick={onBack} style={{
          position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
          background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
          border: "1px solid rgba(255,215,0,0.4)", borderRadius: "20px",
          color: "#FFD700", fontSize: "13px", fontWeight: 700,
          padding: "6px 14px", whiteSpace: "nowrap",
          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
        }}>◀ 返回</button>

        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: "24px", fontWeight: 900, letterSpacing: "3px",
            background: "linear-gradient(180deg, #FFF8DC 0%, #FFD700 40%, #FF8C00 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            filter: "drop-shadow(0 2px 6px rgba(255,140,0,0.6))", lineHeight: 1.2,
          }}>五一狂欢·全民挖金矿</div>
          <div style={{ fontSize: "12px", color: "#FFA07A", marginTop: "3px", fontWeight: 600 }}>
            活动结束：4天12小时33分
          </div>
        </div>

        <button onClick={onShowRules} style={{
          position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
          width: "44px", height: "44px", borderRadius: "50%",
          background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
          border: "1px solid rgba(255,215,0,0.4)",
          color: "#FFD700", fontSize: "11px", fontWeight: 700,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: "1px", boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
        }}>
          <span style={{ fontSize: "18px" }}>📋</span>
          <span style={{ fontSize: "10px" }}>规则</span>
        </button>
      </div>

      {/* ===== 资产栏 ===== */}
      <div style={{
        margin: "0 12px 8px",
        background: "linear-gradient(180deg, rgba(80,20,0,0.9) 0%, rgba(50,10,0,0.95) 100%)",
        border: `1px solid ${exchanged ? "rgba(100,100,100,0.4)" : "rgba(255,215,0,0.5)"}`,
        borderRadius: "10px", padding: "10px 14px",
        display: "flex", alignItems: "center", gap: "12px",
        boxShadow: exchanged ? "none" : "0 0 16px rgba(255,215,0,0.15), inset 0 1px 0 rgba(255,215,0,0.1)",
        transition: "all 0.5s ease", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <span style={{ fontSize: "13px", color: "#CCA050", fontWeight: 600, whiteSpace: "nowrap" }}>我的金铲子</span>
          <span style={{ fontSize: "22px", filter: `drop-shadow(0 0 6px ${exchanged ? "#888" : "#FFD700"})` }}>⛏️</span>
          <span style={{
            fontSize: "26px", fontWeight: 900,
            color: exchanged ? "#888" : "#FFD700",
            fontFamily: "monospace",
            textShadow: exchanged ? "none" : "0 0 12px rgba(255,215,0,0.8)",
            transition: "color 0.5s ease",
          }}>{exchanged ? 0 : shovelCount}</span>
        </div>

        <div style={{ width: "1px", height: "36px", background: "rgba(139,105,20,0.4)", flexShrink: 0 }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "11px", color: "#CCA050", marginBottom: "5px", fontWeight: 600 }}>
            每日进度 {exchanged ? 0 : shovelCount}
          </div>
          <div style={{
            height: "12px", background: "rgba(0,0,0,0.5)",
            borderRadius: "6px", border: "1px solid rgba(139,105,20,0.4)",
            overflow: "hidden", position: "relative",
          }}>
            <div style={{
              height: "100%",
              width: exchanged ? "0%" : `${progressPct}%`,
              background: "linear-gradient(90deg, #FFD700 0%, #FF8C00 60%, #FF4500 100%)",
              borderRadius: "6px",
              boxShadow: "0 0 8px rgba(255,215,0,0.7)",
              transition: "width 0.8s ease",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3px" }}>
            {["0矿", "50矿", "100矿", "200矿", "1400矿"].map(label => (
              <span key={label} style={{ fontSize: "9px", color: "#CCA050" }}>{label}</span>
            ))}
          </div>
        </div>

        <div style={{ width: "1px", height: "36px", background: "rgba(139,105,20,0.4)", flexShrink: 0 }} />

        <button onClick={onGoPlay} style={{
          flexShrink: 0,
          background: "linear-gradient(180deg, #FFE566 0%, #FFD700 40%, #CC9900 100%)",
          border: "2px solid #8B6914", borderRadius: "8px",
          color: "#3D1A0A", fontSize: "14px", fontWeight: 800,
          padding: "10px 16px", whiteSpace: "nowrap",
          boxShadow: "0 4px 12px rgba(255,165,0,0.5), inset 0 1px 0 rgba(255,255,255,0.5)",
          textShadow: "0 1px 0 rgba(255,255,255,0.4)",
        }}>去打牌赚铲子 &gt;</button>
      </div>

      {/* ===== 奖品区域 ===== */}
      <div style={{ margin: "0 12px 10px", display: "flex", gap: "10px" }}>
        {/* 左半区：限量金铲子 */}
        <div style={{
          display: "flex", flexDirection: "column",
          background: "rgba(0,0,0,0.25)", border: "1px solid rgba(139,105,20,0.5)",
          borderRadius: "10px", padding: "8px 10px",
        }}>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#FFD700", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>💎</span><span>【限量金铲子】</span>
            <span style={{ fontSize: "11px", color: "#CCA050", fontWeight: 600 }}>（先到先得）</span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <PrizeCard
              icon={<div style={{
                width: "64px", height: "44px",
                background: "linear-gradient(135deg, #FFD700 0%, #FF8C00 50%, #CC6600 100%)",
                borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px", fontWeight: 900, color: "#FFF",
                textShadow: "0 2px 4px rgba(0,0,0,0.6)",
              }}>50元</div>}
              name="50元话费卡"
              sub="全服限量：100份 / 利20万"
              cost={500}
              shovelCount={exchanged ? 0 : shovelCount}
              canExchange={false}
              badge="兑完即止"
              badgeColor="linear-gradient(135deg, #CC2200 0%, #FF4400 100%)"
              onExchange={onExchange}
              tall
            />
            <PrizeCard
              icon={<div style={{
                width: "56px", height: "56px",
                background: "radial-gradient(circle, #8B6914 0%, #5A3A00 60%, #3D1A00 100%)",
                borderRadius: "50%", border: "3px solid #FFD700",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "28px", boxShadow: "0 0 12px rgba(255,215,0,0.5)",
              }}>🖼️</div>}
              name={`"五一劳模"绝版头像框`}
              sub="全服限量：0/1"
              cost={800}
              shovelCount={exchanged ? 0 : shovelCount}
              canExchange={false}
              badge="绝版限定"
              badgeColor="linear-gradient(135deg, #8B0066 0%, #CC0099 100%)"
              onExchange={onExchange}
              tall
            />
          </div>
        </div>

        {/* 右半区：初级场铲子 + 新手专享 */}
        <div style={{
          display: "flex", flexDirection: "column",
          background: "rgba(0,0,0,0.25)", border: "1px solid rgba(139,105,20,0.5)",
          borderRadius: "10px", padding: "8px 10px",
        }}>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#FFD700", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>🎁</span><span>【实用道具】</span>
            <span style={{ fontSize: "11px", color: "#CCA050", fontWeight: 600 }}>（每日刷新）</span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {/* 新手专享礼包 - 高亮可兑换 */}
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              background: exchanged
                ? "linear-gradient(180deg, #F5E6C8 0%, #EDD9A3 100%)"
                : "linear-gradient(180deg, #FFF8E8 0%, #F5E6C8 60%, #EDD9A3 100%)",
              border: exchanged ? "2px solid #B8965A" : "2px solid #FFD700",
              borderRadius: "10px", padding: "10px 8px 8px",
              alignItems: "center", position: "relative",
              boxShadow: exchanged
                ? "inset 0 1px 0 rgba(255,255,255,0.8), 2px 4px 8px rgba(0,0,0,0.4)"
                : "0 0 20px rgba(255,200,0,0.6), inset 0 1px 0 rgba(255,255,255,0.8), 2px 4px 8px rgba(0,0,0,0.4)",
              transition: "all 0.5s ease",
              overflow: "hidden",
            }}>
              {/* 纸张纹理 */}
              <div style={{
                position: "absolute", inset: 0, borderRadius: "8px",
                background: "repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(180,140,60,0.06) 18px, rgba(180,140,60,0.06) 19px)",
                pointerEvents: "none",
              }} />
              {/* 新手专享角标 */}
              {!exchanged && (
                <div style={{
                  position: "absolute", top: 0, right: 0,
                  background: "linear-gradient(135deg, #FF4500 0%, #FF8C00 100%)",
                  color: "#FFF", fontSize: "10px", fontWeight: 800,
                  padding: "3px 8px 3px 12px", borderRadius: "0 8px 0 12px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.4)", zIndex: 2,
                }}>新手专享</div>
              )}
              {exchanged && (
                <div style={{
                  position: "absolute", top: 0, right: 0,
                  background: "rgba(100,100,100,0.5)",
                  color: "#AAA", fontSize: "10px", fontWeight: 800,
                  padding: "3px 8px 3px 12px", borderRadius: "0 8px 0 12px",
                  zIndex: 2,
                }}>已兑换</div>
              )}

              <div style={{ fontSize: "40px", marginBottom: "6px", marginTop: "14px", filter: exchanged ? "grayscale(1) opacity(0.5)" : "none", lineHeight: 1 }}>🎓</div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: exchanged ? "#999" : "#5A2D00", textAlign: "center", marginBottom: "3px", textShadow: "0 1px 0 rgba(255,255,255,0.6)" }}>
                破冰礼包
              </div>
              <div style={{ fontSize: "11px", color: exchanged ? "#BBB" : "#8B5A00", textAlign: "center", marginBottom: "4px" }}>5万悟性 · 限首次</div>
              <div style={{
                background: exchanged ? "rgba(150,150,150,0.2)" : "rgba(139,90,0,0.15)",
                border: `1px solid ${exchanged ? "#CCC" : "#B8965A"}`,
                borderRadius: "12px", padding: "3px 10px",
                fontSize: "12px", color: exchanged ? "#AAA" : "#6B3A00",
                fontWeight: 700, marginBottom: "8px", whiteSpace: "nowrap",
              }}>需求：3铲子</div>
              <button
                disabled={exchanged}
                onClick={!exchanged ? onExchange : undefined}
                style={{
                  width: "100%", padding: "7px 0", borderRadius: "6px",
                  fontSize: "13px", fontWeight: 800, border: "none",
                  cursor: exchanged ? "not-allowed" : "pointer",
                  background: exchanged
                    ? "rgba(150,150,150,0.3)"
                    : "linear-gradient(180deg, #FF6B35 0%, #CC2200 60%, #991A00 100%)",
                  color: exchanged ? "#999" : "#FFF8DC",
                  boxShadow: exchanged ? "none" : "0 3px 8px rgba(180,30,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
                  textShadow: exchanged ? "none" : "0 1px 2px rgba(0,0,0,0.6)",
                  transition: "all 0.3s ease",
                  animation: !exchanged ? "btnPulse 1.5s ease-in-out infinite" : "none",
                }}
              >{exchanged ? "已兑换" : "兑换"}</button>
            </div>

            {/* 记牌器 */}
            <PrizeCard
              icon={<div style={{
                width: "52px", height: "52px",
                background: "linear-gradient(135deg, #4A8B6A 0%, #2D6B4A 100%)",
                borderRadius: "8px", border: "2px solid #8B6914",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", fontWeight: 800, color: "#FFF8DC",
                textAlign: "center", lineHeight: 1.2,
              }}>记牌<br/>器</div>}
              name="记牌器(1天)"
              sub=""
              cost={50}
              shovelCount={exchanged ? 0 : shovelCount}
              canExchange={false}
              limitText="剩余：0/1"
              onExchange={onExchange}
            />
            {/* 破产救济卡 */}
            <PrizeCard
              icon={<div style={{
                width: "52px", height: "52px",
                background: "linear-gradient(135deg, #8B0000 0%, #CC2200 50%, #8B0000 100%)",
                borderRadius: "8px", border: "2px solid #FFD700",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px", fontWeight: 900, color: "#FFD700",
                textShadow: "0 0 8px rgba(255,215,0,0.8)",
              }}>破</div>}
              name="破产救济卡"
              sub=""
              cost={80}
              shovelCount={exchanged ? 0 : shovelCount}
              canExchange={false}
              limitText="今日限量：0/1"
              onExchange={onExchange}
            />
          </div>
        </div>
      </div>

      {/* ===== 底部区域 ===== */}
      <div style={{ margin: "8px 12px 10px", display: "flex", gap: "10px", alignItems: "stretch", flexShrink: 0 }}>
        <div style={{
          flex: 1, background: "rgba(0,0,0,0.5)",
          border: "1px solid rgba(139,105,20,0.4)", borderRadius: "8px",
          padding: "0 12px", height: "28px",
          display: "flex", alignItems: "center", gap: "8px", overflow: "hidden",
        }}>
          <span style={{ fontSize: "16px", flexShrink: 0 }}>📢</span>
          <MarqueeBanner />
          <span style={{ fontSize: "16px", flexShrink: 0 }}>📢</span>
        </div>

      </div>

      <div style={{ height: "3px", background: "linear-gradient(90deg, transparent 0%, #8B6914 20%, #FFD700 50%, #8B6914 80%, transparent 100%)" }} />

      {/* 兑换成功后的成就提示 */}
      {exchanged && (
        <div style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.0)",
          pointerEvents: "none", zIndex: 50,
        }}>
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            background: "linear-gradient(135deg, #1A4A00 0%, #2D7A00 100%)",
            border: "2px solid #4ADE80", borderRadius: "16px",
            padding: "20px 32px", textAlign: "center",
            boxShadow: "0 8px 32px rgba(74,222,128,0.4)",
            animation: "modalSlideIn 0.4s ease-out forwards",
            pointerEvents: "auto",
          }}>
            <div style={{ fontSize: "40px", marginBottom: "8px" }}>🎉</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#4ADE80", marginBottom: "6px" }}>破冰成功！</div>
            <div style={{ fontSize: "13px", color: "#86EFAC", marginBottom: "16px" }}>
              5万悟性已到账，继续挖矿解锁更多大奖！
            </div>
            <button
              onClick={onReturnLobby}
              style={{
                background: "linear-gradient(180deg, #4ADE80 0%, #16A34A 100%)",
                border: "none", borderRadius: "8px",
                color: "#FFF", fontSize: "14px", fontWeight: 800,
                padding: "10px 24px",
                boxShadow: "0 4px 12px rgba(74,222,128,0.4)",
              }}
            >返回大厅继续挖矿 ⛏️</button>
          </div>
        </div>
      )}

      {/* 规则弹窗 */}
      {showRules && (
        <div style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
        }} onClick={onHideRules}>
          <div className="game-panel animate-modal-in"
            style={{ width: "85%", maxWidth: "360px", padding: "0", overflow: "hidden" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              background: "linear-gradient(180deg, #8B0000 0%, #5A0000 100%)",
              borderBottom: "2px solid #8B6914", padding: "12px 16px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#FFD700" }}>📋 活动规则</div>
              <button onClick={onHideRules} style={{
                background: "rgba(0,0,0,0.4)", border: "1px solid #666",
                borderRadius: "50%", width: "26px", height: "26px",
                color: "#CCC", fontSize: "16px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>×</button>
            </div>
            <div style={{ padding: "16px", fontSize: "13px", color: "#CCA050", lineHeight: 2 }}>
              <div style={{ color: "#FFD700", fontWeight: 700, marginBottom: "8px" }}>🪙 铲子获取方式</div>
              <div>· 五一期间每局牌局均可随机掉落金铲子</div>
              <div>· 初级高手场掉落倍率 <span style={{ color: "#FF8C00", fontWeight: 700 }}>×3</span></div>
              <div>· 每日最多累积 100 把（开通矿工卡提升至400）</div>
              <div style={{ color: "#FFD700", fontWeight: 700, margin: "8px 0" }}>🎁 兑换规则</div>
              <div>· 限量大奖先到先得，兑完即止</div>
              <div>· 实用道具每日0点刷新，限购数量重置</div>
              <div>· 活动结束后未使用铲子自动清零</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== 主组件 =====
export default function Home() {
  const [step, setStep] = useState<GameStep>("lobby");
  const [shovelCount, setShovelCount] = useState(0);
  const [showShovelFly, setShowShovelFly] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [exchanged, setExchanged] = useState(false);
  const [showVictoryNumber, setShowVictoryNumber] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2800);
  };

  const handleVictoryEnter = () => {
    setShowVictoryNumber(false);
    setShowProgress(false);
    setShowShovelFly(false);
    setTimeout(() => setShowShovelFly(true), 400);
    setTimeout(() => setShowVictoryNumber(true), 700);
    setTimeout(() => setShowProgress(true), 1300);
  };

  useEffect(() => {
    if (step === "victory") handleVictoryEnter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // ---- Step 1: 大厅 ----
  const renderLobby = (showGameHighlight = false) => (
    <div className="relative w-full h-full overflow-hidden" style={{ background: "#1A0A05" }}>
      <img
        src="/lobby-bg.png"
        alt="黄金岛游戏大厅"
        className="absolute inset-0 w-full h-full object-contain"
        style={{ objectPosition: "center" }}
      />

      {/* 五一金矿专属入口图标 */}
      <div className="absolute" style={{ right: "180px", top: "180px", zIndex: 30 }}>
        <div className="relative cursor-pointer" onClick={() => setStep("activity_panel")}>
          <img
            src="/gold-mine-icon.png"
            alt="五一挖金矿"
            className="animate-breathing-glow"
            style={{ width: "90px", height: "90px", objectFit: "contain", display: "block" }}
          />
          {/* 小红点 */}
          <div className="absolute animate-red-dot-pulse" style={{
            top: "-4px", right: "-4px", width: "16px", height: "16px",
            borderRadius: "50%", background: "#FF2222",
            border: "2px solid #FFF", boxShadow: "0 0 8px rgba(255,34,34,0.8)",
          }} />
          {/* 手指 */}
          <div className="absolute animate-float" style={{
            bottom: "-28px", left: "50%", transform: "translateX(-50%)",
            fontSize: "20px", filter: "drop-shadow(0 0 6px #FFD700)",
          }}>👆</div>
          {/* 气泡提示 */}
          <div style={{
            position: "absolute", right: "80px", top: "50%", transform: "translateY(-50%)",
            background: "rgba(0,0,0,0.85)", border: "1px solid #FFD700",
            borderRadius: "8px", padding: "6px 10px",
            fontSize: "11px", color: "#FFD700", fontWeight: 700,
            whiteSpace: "nowrap", boxShadow: "0 0 12px rgba(255,215,0,0.3)",
            pointerEvents: "none",
          }}>
            点我参加活动！
            <div style={{
              position: "absolute", right: "-7px", top: "50%", transform: "translateY(-50%)",
              width: 0, height: 0,
              borderTop: "6px solid transparent", borderBottom: "6px solid transparent",
              borderLeft: "7px solid #FFD700",
            }} />
          </div>
        </div>
      </div>

      {/* 三打哈高亮引导 */}
      {showGameHighlight && (
        <>
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)", zIndex: 20, pointerEvents: "none" }} />
          <div className="absolute" style={{
            bottom: "170px", left: "50%", transform: "translateX(-50%)", zIndex: 25,
            background: "rgba(0,0,0,0.85)", border: "2px solid #FFD700", borderRadius: "12px",
            padding: "10px 20px", color: "#FFD700", fontWeight: 700, fontSize: "15px",
            whiteSpace: "nowrap", boxShadow: "0 0 20px rgba(255,215,0,0.4)",
          }}>👇 点击【三打哈】开始挖矿！</div>
          <div className="absolute cursor-pointer" style={{
            bottom: "20px", left: "50%", transform: "translateX(-50%)",
            width: "140px", height: "130px", zIndex: 26,
            borderRadius: "12px", border: "3px solid #FFD700",
            boxShadow: "0 0 30px rgba(255,215,0,0.8)",
            animation: "btnPulse 1.5s ease-in-out infinite",
          }} onClick={() => setStep("room_select")} />
        </>
      )}

      <StepIndicator step={showGameHighlight ? "lobby_game" : "lobby"} />
    </div>
  );

  // ---- Step 2b: 矿工推荐模态框 ----
  const renderMinerRecommend = () => (
    <div className="relative w-full h-full overflow-hidden">
      <img src="/lobby-bg.png" alt="背景" className="absolute inset-0 w-full h-full object-contain" style={{ objectPosition: "center" }} />
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60 }}>
      <div className="game-panel animate-modal-in" style={{
        width: "88%", maxWidth: "420px", padding: "0", overflow: "hidden",
      }}>
        <div style={{
          background: "linear-gradient(180deg, #6B3A00 0%, #3D1A00 100%)",
          borderBottom: "2px solid #8B6914", padding: "14px 20px", textAlign: "center",
        }}>
          <div style={{ fontSize: "24px", marginBottom: "4px" }}>⛏️</div>
          <div className="animate-gold-sweep" style={{ fontSize: "18px", fontWeight: 900 }}>矿工老手推荐</div>
        </div>
        <div style={{ padding: "16px 20px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px",
            background: "rgba(139, 105, 20, 0.1)", border: "1px solid rgba(139, 105, 20, 0.3)",
            borderRadius: "10px", padding: "12px",
          }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "50%",
              background: "linear-gradient(135deg, #8B3A00 0%, #CC6600 100%)",
              border: "2px solid #FFD700",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "28px", flexShrink: 0,
            }}>👷</div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#FFD700", marginBottom: "4px" }}>老矿工张大叔</div>
              <div style={{
                fontSize: "13px", color: "#FFF8DC", lineHeight: 1.6,
                background: "rgba(0,0,0,0.3)", borderRadius: "8px",
                padding: "8px 10px", borderLeft: "3px solid #FFD700",
              }}>
                "新来的兄弟！去玩<span style={{ color: "#FF8C00", fontWeight: 700 }}>初级高手场</span>，铲子掉落是普通场的 <span style={{ color: "#FFD700", fontWeight: 900, fontSize: "16px" }}>3倍</span>！"
              </div>
            </div>
          </div>
          <div style={{
            background: "linear-gradient(135deg, rgba(139,58,0,0.3) 0%, rgba(61,26,0,0.5) 100%)",
            border: "2px solid #FF8C00", borderRadius: "10px",
            padding: "12px 16px", marginBottom: "16px",
            boxShadow: "0 0 20px rgba(255,140,0,0.3)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "16px" }}>🎮</span>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "#FFF8DC" }}>三打哈 · 初级高手场</span>
                </div>
                <div style={{ fontSize: "12px", color: "#CCA050" }}>底注：500 · 最低入场：5,000</div>
              </div>
              <div style={{
                background: "linear-gradient(135deg, #FF4500 0%, #FF8C00 100%)",
                border: "1px solid #FFD700", borderRadius: "6px",
                padding: "4px 10px", fontSize: "13px", fontWeight: 800,
                color: "#FFF", textShadow: "0 1px 2px rgba(0,0,0,0.5)",
              }}>🔥 铲子 ×3</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button style={{
              flex: 1, padding: "11px",
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "8px", color: "#AAA", fontSize: "14px",
            }} onClick={() => setStep("activity_panel")}>再看看</button>
            <button className="game-btn-primary" style={{ flex: 2, padding: "11px", fontSize: "14px", borderRadius: "8px" }}
              onClick={() => setStep("lobby_game")}>好的，出发！🚀</button>
          </div>
        </div>
      </div>
      </div>
      <StepIndicator step="miner_recommend" />
    </div>
  );

  // ---- Step 3b: 场次选择 ----
  const renderRoomSelect = () => (
    <div className="relative w-full h-full overflow-hidden">
      <img src="/lobby-bg.png" alt="背景" className="absolute inset-0 w-full h-full object-contain" style={{ objectPosition: "center" }} />
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      <div className="game-panel animate-modal-in" style={{
        width: "92%", maxWidth: "400px", padding: "0", overflow: "hidden",
      }}>
        <div style={{
          background: "linear-gradient(180deg, #8B0000 0%, #5A0000 100%)",
          borderBottom: "2px solid #8B6914", padding: "14px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <button onClick={() => setStep("lobby_game")} style={{
            background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "6px", color: "#CCC", padding: "4px 10px", fontSize: "13px",
          }}>← 返回</button>
          <div className="text-center">
            <div style={{ fontSize: "18px", fontWeight: 900, color: "#FFD700" }}>🎴 三打哈</div>
            <div style={{ fontSize: "11px", color: "#CCA050" }}>选择场次</div>
          </div>
          <div style={{ width: "52px" }} />
        </div>
        <div style={{ padding: "14px 16px" }}>
          {/* 初级高手场 */}
          <div className="room-card featured cursor-pointer" style={{
            padding: "14px 16px", marginBottom: "10px",
            animation: "cardSlideIn 0.3s ease-out 0.1s both",
            position: "relative", overflow: "hidden",
          }} onClick={() => setStep("playing")}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "2px",
              background: "linear-gradient(90deg, transparent, #FF8C00, transparent)",
            }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 800, color: "#FFF8DC" }}>初级高手场</span>
                  <div style={{
                    background: "linear-gradient(135deg, #FF4500 0%, #FF8C00 100%)",
                    border: "1px solid #FFD700", borderRadius: "4px",
                    padding: "2px 8px", fontSize: "12px", fontWeight: 800, color: "#FFF",
                    boxShadow: "0 0 8px rgba(255,140,0,0.5)",
                  }}>🔥 铲子掉落 ×3</div>
                </div>
                <div style={{ fontSize: "12px", color: "#CCA050", marginBottom: "4px" }}>底注：500 · 入场：5,000 起</div>
                <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "#888" }}>
                  <span>👥 在线：1,247</span><span>🃏 桌数：312</span>
                </div>
              </div>
              <button className="game-btn-primary" style={{ padding: "10px 18px", fontSize: "14px", borderRadius: "8px", flexShrink: 0 }}>进入</button>
            </div>
          </div>
          {/* 普通场 */}
          <div className="room-card" style={{ padding: "14px 16px", marginBottom: "10px", animation: "cardSlideIn 0.3s ease-out 0.2s both" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "#FFF8DC" }}>普通场</span>
                  <div style={{ background: "rgba(100,100,100,0.5)", border: "1px solid #555", borderRadius: "4px", padding: "2px 8px", fontSize: "12px", color: "#888" }}>铲子掉落 ×1</div>
                </div>
                <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>底注：100 · 入场：1,000 起</div>
                <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "#666" }}>
                  <span>👥 在线：3,891</span><span>🃏 桌数：972</span>
                </div>
              </div>
              <button style={{
                padding: "10px 18px", fontSize: "14px", borderRadius: "8px",
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: "#CCC",
              }} onClick={() => setStep("playing")}>进入</button>
            </div>
          </div>
        </div>
      </div>
      </div>
      <StepIndicator step="room_select" />
    </div>
  );

  // ---- 打牌中 ----
  const renderPlaying = () => (
    <div className="relative w-full h-full overflow-hidden">
      <img src="/lobby-bg.png" alt="背景" className="absolute inset-0 w-full h-full object-contain" style={{ objectPosition: "center" }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div style={{
        width: "280px", height: "180px", borderRadius: "90px",
        background: "radial-gradient(ellipse, #2D7A00 0%, #1A4A00 60%, #0D2800 100%)",
        border: "8px solid #5A3A00",
        boxShadow: "0 0 40px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,0,0,0.4)",
        position: "relative", marginBottom: "32px",
      }}>
        {["♠A", "♥K", "♦Q", "♣J", "♠10"].map((card, i) => (
          <div key={i} style={{
            position: "absolute", width: "36px", height: "52px",
            background: "#FFF", borderRadius: "4px", border: "1px solid #CCC",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "11px", fontWeight: 700,
            color: card.includes("♥") || card.includes("♦") ? "#CC0000" : "#1A1A1A",
            left: `${30 + i * 44}px`, top: "64px",
            transform: `rotate(${(i - 2) * 5}deg)`,
            boxShadow: "2px 2px 6px rgba(0,0,0,0.4)",
          }}>{card}</div>
        ))}
      </div>
      <div style={{ color: "#FFD700", fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>牌局进行中...</div>
      <div style={{ color: "#888", fontSize: "13px", marginBottom: "32px" }}>三打哈 · 初级高手场</div>
      <button className="game-btn-gold" style={{ padding: "14px 40px", fontSize: "16px", borderRadius: "10px" }}
        onClick={() => { setShovelCount(3); setStep("victory"); }}>
        🏆 结束牌局（模拟胜利）
      </button>
      </div>
      <StepIndicator step="playing" />
    </div>
  );

  // ---- Step 4: 胜利结算 ----
  const renderVictory = () => (
    <div className="relative w-full h-full overflow-hidden">
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 30%, #3A1A00 0%, #1A0800 50%, #0A0400 100%)",
      }} />
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: `${Math.random() * 4 + 2}px`, height: `${Math.random() * 4 + 2}px`,
          borderRadius: "50%",
          background: i % 3 === 0 ? "#FFD700" : i % 3 === 1 ? "#FF8C00" : "#FFF8DC",
          left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
          opacity: Math.random() * 0.6 + 0.2,
          animation: `sparkle ${Math.random() * 2 + 1}s ease-out ${Math.random() * 2}s infinite`,
          "--tx": `${(Math.random() - 0.5) * 100}px`,
          "--ty": `${-(Math.random() * 100 + 20)}px`,
        } as React.CSSProperties} />
      ))}

      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 50 }}>
      <div className="victory-panel animate-modal-in" style={{
        width: "92%", maxWidth: "380px", padding: "0", overflow: "hidden",
      }}>
        <div style={{
          padding: "20px", textAlign: "center",
          background: "linear-gradient(180deg, rgba(255,215,0,0.15) 0%, transparent 100%)",
          borderBottom: "1px solid rgba(255,215,0,0.2)",
        }}>
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ fontSize: "28px", animation: `victoryStarBurst 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.15}s both` }}>⭐</div>
            ))}
          </div>
          <div style={{
            fontSize: "32px", fontWeight: 900,
            background: "linear-gradient(180deg, #FFF8DC 0%, #FFD700 50%, #FF8C00 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            letterSpacing: "4px", filter: "drop-shadow(0 2px 8px rgba(255,215,0,0.5))",
          }}>VICTORY</div>
          <div style={{ fontSize: "13px", color: "#CCA050", marginTop: "4px" }}>三打哈 · 初级高手场 · 第1局</div>
        </div>

        <div style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", padding: "8px 12px", background: "rgba(255,215,0,0.05)", borderRadius: "8px" }}>
            <span style={{ color: "#888", fontSize: "13px" }}>本局金币</span>
            <span style={{ color: "#FFD700", fontWeight: 700, fontSize: "15px" }}>+2,450 💰</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", padding: "8px 12px", background: "rgba(255,215,0,0.05)", borderRadius: "8px" }}>
            <span style={{ color: "#888", fontSize: "13px" }}>悟性奖励</span>
            <span style={{ color: "#4ADE80", fontWeight: 700, fontSize: "15px" }}>+800 ✨</span>
          </div>

          {/* 金铲子掉落 */}
          <div style={{
            background: "linear-gradient(135deg, rgba(139,58,0,0.4) 0%, rgba(61,26,0,0.6) 100%)",
            border: "2px solid #FF8C00", borderRadius: "12px",
            padding: "16px", textAlign: "center", position: "relative", overflow: "hidden",
            boxShadow: "0 0 30px rgba(255,140,0,0.3)",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, #FFD700, transparent)" }} />
            <div style={{ fontSize: "13px", color: "#CCA050", marginBottom: "8px" }}>🎉 恭喜获得首批挖矿工具！</div>
            <div style={{ position: "relative", height: "60px", marginBottom: "8px" }}>
              {showShovelFly && <ShovelFlyAnimation onDone={() => setShowShovelFly(false)} />}
              <div style={{ display: "flex", justifyContent: "center", gap: "12px", paddingTop: "8px" }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{
                    fontSize: "32px",
                    animation: showVictoryNumber ? `numberPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.1}s both` : "none",
                    filter: "drop-shadow(0 0 8px #FFD700)",
                  }}>⛏️</div>
                ))}
              </div>
            </div>
            <div style={{
              fontSize: "28px", fontWeight: 900, color: "#FFD700", fontFamily: "monospace",
              textShadow: "0 0 20px rgba(255,215,0,0.8)", marginBottom: "6px",
            }}>
              {showVictoryNumber ? (
                <span style={{ animation: "numberPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both" }}>+3 ⛏️</span>
              ) : "+0 ⛏️"}
            </div>
            <div style={{ fontSize: "13px", color: "#FF8C00", fontWeight: 600, marginBottom: "10px" }}>
              今日进度：{showProgress ? "3" : "0"} / 100
            </div>
            <div style={{ height: "8px", background: "rgba(0,0,0,0.5)", borderRadius: "4px", border: "1px solid rgba(139,105,20,0.4)", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: showProgress ? "3%" : "0%",
                background: "linear-gradient(90deg, #FFD700 0%, #FF8C00 100%)",
                borderRadius: "4px", boxShadow: "0 0 8px rgba(255,215,0,0.6)",
                transition: "width 1s ease-out 0.5s",
              }} />
            </div>
          </div>
        </div>

        <div style={{ padding: "0 20px 20px", display: "flex", gap: "10px" }}>
          <button style={{
            flex: 1, padding: "12px",
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "8px", color: "#CCC", fontSize: "14px",
          }} onClick={() => setStep("room_select")}>再来一局</button>
          <button className="game-btn-gold animate-btn-pulse" style={{ flex: 2, padding: "12px", fontSize: "14px", borderRadius: "8px" }}
            onClick={() => setStep("activity_shop")}>立即去兑换 →</button>
        </div>
      </div>
      </div>

      <StepIndicator step="victory" />
    </div>
  );

  // ===== 主渲染 =====
  return (
    <div style={{
      width: "100vw", height: "100vh", overflow: "hidden",
      position: "relative", background: "#0A0400",
      fontFamily: '"PingFang SC", "Microsoft YaHei", "微软雅黑", system-ui, sans-serif',
    }}>
      <div style={{ width: "100%", height: "100%" }}>
        {step === "lobby" && renderLobby(false)}
        {step === "activity_panel" && (
          <>
            {renderLobby(false)}
            <div style={{
              position: "absolute", inset: 0, zIndex: 40,
              background: "rgba(5,2,0,0.62)",
              backdropFilter: "blur(1px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "10px 14px",
              boxSizing: "border-box",
            }}>
              <ActivityPanel
                shovelCount={shovelCount}
                exchanged={exchanged}
                onBack={() => setStep("lobby")}
                onGoPlay={() => setStep("miner_recommend")}
                onExchange={() => { }}
                showRules={showRules}
                onShowRules={() => setShowRules(true)}
                onHideRules={() => setShowRules(false)}
              />
            </div>
          </>
        )}
        {step === "miner_recommend" && renderMinerRecommend()}
        {step === "lobby_game" && renderLobby(true)}
        {step === "room_select" && renderRoomSelect()}
        {step === "playing" && renderPlaying()}
        {step === "victory" && renderVictory()}
        {step === "activity_shop" && (
          <>
            {renderLobby(false)}
            <div style={{
              position: "absolute", inset: 0, zIndex: 40,
              background: "rgba(5,2,0,0.62)",
              backdropFilter: "blur(1px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "10px 14px", boxSizing: "border-box",
            }}>
              <ActivityShop
                shovelCount={shovelCount}
                exchanged={exchanged}
                onBack={() => setStep("lobby")}
                onGoPlay={() => setStep("room_select")}
                onExchange={() => {
                  setExchanged(true);
                  setShovelCount(0);
                  triggerToast("✅ 兑换成功！5万悟性已到账");
                }}
                onReturnLobby={() => {
                  setShovelCount(0);
                  setExchanged(false);
                  setStep("lobby");
                }}
                showRules={showRules}
                onShowRules={() => setShowRules(true)}
                onHideRules={() => setShowRules(false)}
              />
            </div>
          </>
        )}
      </div>

      {/* 全局 Toast */}
      <GameToast message={toastMessage} visible={showToast} />

      {/* 步骤指示器（活动面板和商店内置，其他页面单独显示） */}
      {(step === "activity_panel") && (
        <div className="absolute top-4 left-1/2 z-50 step-indicator" style={{ transform: "translateX(-50%)" }}>
          Step 2/5 · 活动面板 · 了解规则
        </div>
      )}
      {(step === "activity_shop") && (
        <div className="absolute top-4 left-1/2 z-50 step-indicator" style={{ transform: "translateX(-50%)" }}>
          Step 5/5 · 活动商店 · 完成兑换
        </div>
      )}

      {/* 底部原型导航 */}
      <div style={{
        position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)",
        zIndex: 100, display: "flex", gap: "5px", alignItems: "center",
        background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,215,0,0.2)",
        borderRadius: "20px", padding: "5px 10px", backdropFilter: "blur(8px)",
      }}>
        <span style={{ fontSize: "9px", color: "rgba(255,215,0,0.5)", marginRight: "2px", whiteSpace: "nowrap" }}>原型导航：</span>
        {["①大厅", "②活动面板", "③矿工推荐", "④场次选择", "⑤牌局", "⑥胜利结算", "⑦活动商店"].map((label, i) => {
          const stepKeys: GameStep[] = ["lobby", "activity_panel", "miner_recommend", "room_select", "playing", "victory", "activity_shop"];
          const isActive = step === stepKeys[i];
          return (
            <button key={i}
              onClick={() => {
                if (i === 5) { setShovelCount(3); setExchanged(false); }
                if (i === 6) { setShovelCount(3); setExchanged(false); }
                setStep(stepKeys[i]);
              }}
              style={{
                padding: "3px 7px", borderRadius: "10px", fontSize: "10px",
                fontWeight: isActive ? 700 : 400,
                background: isActive ? "rgba(255,215,0,0.3)" : "transparent",
                border: isActive ? "1px solid #FFD700" : "1px solid transparent",
                color: isActive ? "#FFD700" : "rgba(255,255,255,0.5)",
                transition: "all 0.2s ease", whiteSpace: "nowrap",
              }}
            >{label}</button>
          );
        })}
      </div>
    </div>
  );
}
