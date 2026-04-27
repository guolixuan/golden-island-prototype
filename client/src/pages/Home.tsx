/**
 * 黄金岛·五一全民挖金矿活动原型
 * 设计哲学：「黄金矿脉」国风游戏UI美学
 * 色彩：深红 #8B0000 + 金色 #FFD700 + 暗棕木纹底色
 * 动效：呼吸发光、金铲子飞溅、数字跳动、手指引导
 */

import { useState, useEffect, useRef } from "react";

// ===== 游戏状态类型 =====
type GameStep =
  | "lobby"           // Step 1: 大厅
  | "activity_panel"  // Step 2: 活动面板（0资产）
  | "miner_recommend" // Step 2b: 矿工推荐模态框
  | "lobby_game"      // Step 3: 回到大厅，引导点三打哈
  | "room_select"     // Step 3b: 场次选择
  | "playing"         // 打牌中（简化）
  | "victory"         // Step 4: 胜利结算
  | "activity_shop";  // Step 5: 活动商店（有3铲子）

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
            left: "50%",
            top: "55%",
            fontSize: "36px",
            animation: `shovelFly${i} 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${(i - 1) * 0.12}s forwards`,
          }}
        >
          ⛏️
        </div>
      ))}
      {/* 金光粒子 */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={`spark-${i}`}
          className="absolute rounded-full"
          style={{
            left: "50%",
            top: "55%",
            width: "6px",
            height: "6px",
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

// ===== 数字跳动组件 =====
function AnimatedNumber({ target, duration = 800 }: { target: number; duration?: number }) {
  const [current, setCurrent] = useState(0);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    startTime.current = null;
    let raf: number;
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return <span>{current}</span>;
}

// ===== Toast 组件 =====
function GameToast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <div
      className="fixed z-[9999] px-6 py-3 rounded-xl font-bold text-lg"
      style={{
        left: "50%",
        bottom: "120px",
        transform: "translateX(-50%)",
        background: "linear-gradient(135deg, #1A4A00 0%, #2D7A00 100%)",
        border: "2px solid #4ADE80",
        color: "#DCFCE7",
        boxShadow: "0 8px 32px rgba(74, 222, 128, 0.4)",
        animation: "toastSlideUp 2.5s ease-out forwards",
        whiteSpace: "nowrap",
      }}
    >
      {message}
    </div>
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
    <div
      className="absolute top-4 left-1/2 z-50 step-indicator"
      style={{ transform: "translateX(-50%)" }}
    >
      Step {info.num}/5 · {info.label}
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

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2800);
  };

  const handleVictoryEnter = () => {
    setShowVictoryNumber(false);
    setShowProgress(false);
    setShowShovelFly(false);
    // 延迟触发金铲子飞出
    setTimeout(() => setShowShovelFly(true), 400);
    // 数字跳动
    setTimeout(() => setShowVictoryNumber(true), 700);
    // 进度条充填
    setTimeout(() => setShowProgress(true), 1300);
  };

  useEffect(() => {
    if (step === "victory") handleVictoryEnter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // ===== 渲染各步骤 =====

  // ---- Step 1: 大厅 ----
  const renderLobby = (showGameHighlight = false) => (
    <div className="relative w-full h-full overflow-hidden" style={{ background: "#1A0A05" }}>
      {/* 大厅底图 */}
      <img
        src="/manus-storage/lobby-bg_ddb0d8a4.webp"
        alt="黄金岛游戏大厅"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: "center" }}
      />

      {/* 右侧菜单栏覆盖层 - 五一金矿专属入口 */}
      <div
        className="absolute"
        style={{ right: "8px", top: "340px", zIndex: 30 }}
      >
        {/* 五一金矿入口图标 */}
        <div
          className="relative cursor-pointer"
          onClick={() => setStep("activity_panel")}
        >
          {/* 发光底座 */}
          <div
            className="animate-breathing-glow"
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #8B0000 0%, #CC2200 50%, #FF4500 100%)",
              border: "2px solid #FFD700",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              boxShadow: "0 0 20px rgba(255,215,0,0.6)",
            }}
          >
            {/* 矿山图标 */}
            <div style={{ fontSize: "28px", lineHeight: 1 }}>⛏️</div>
            <div
              style={{
                fontSize: "10px",
                fontWeight: 800,
                color: "#FFD700",
                textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                marginTop: "2px",
                letterSpacing: "0.5px",
              }}
            >
              五一金矿
            </div>
          </div>

          {/* 小红点 */}
          <div
            className="absolute animate-red-dot-pulse"
            style={{
              top: "-4px",
              right: "-4px",
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              background: "#FF2222",
              border: "2px solid #FFF",
              boxShadow: "0 0 8px rgba(255,34,34,0.8)",
            }}
          />

          {/* 点击提示箭头 */}
          <div
            className="absolute animate-float"
            style={{
              bottom: "-28px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "20px",
              filter: "drop-shadow(0 0 6px #FFD700)",
            }}
          >
            👆
          </div>
          {/* 文字提示 */}
          <div
            style={{
              position: "absolute",
              right: "80px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(0,0,0,0.85)",
              border: "1px solid #FFD700",
              borderRadius: "8px",
              padding: "6px 10px",
              fontSize: "11px",
              color: "#FFD700",
              fontWeight: 700,
              whiteSpace: "nowrap",
              boxShadow: "0 0 12px rgba(255,215,0,0.3)",
              pointerEvents: "none",
            }}
          >
            点我参加活动！
            {/* 尖角 */}
            <div style={{
              position: "absolute",
              right: "-7px",
              top: "50%",
              transform: "translateY(-50%)",
              width: 0,
              height: 0,
              borderTop: "6px solid transparent",
              borderBottom: "6px solid transparent",
              borderLeft: "7px solid #FFD700",
            }} />
          </div>
        </div>
      </div>

      {/* 三打哈高亮引导（Step 3 回到大厅时） */}
      {showGameHighlight && (
        <>
          {/* 暗化遮罩，只留底部游戏区域 */}
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(0,0,0,0.55)",
              zIndex: 20,
              pointerEvents: "none",
            }}
          />
          {/* 底部游戏区域高亮 */}
          <div
            className="absolute"
            style={{
              bottom: 0,
              left: 0,
              right: 0,
              height: "160px",
              zIndex: 21,
              pointerEvents: "none",
              boxShadow: "0 -20px 60px rgba(255,215,0,0.3)",
            }}
          />
          {/* 引导文字 */}
          <div
            className="absolute"
            style={{
              bottom: "170px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 25,
              background: "rgba(0,0,0,0.85)",
              border: "2px solid #FFD700",
              borderRadius: "12px",
              padding: "10px 20px",
              color: "#FFD700",
              fontWeight: 700,
              fontSize: "15px",
              whiteSpace: "nowrap",
              boxShadow: "0 0 20px rgba(255,215,0,0.4)",
            }}
          >
            👇 点击【三打哈】开始挖矿！
          </div>
          {/* 三打哈点击区域 */}
          <div
            className="absolute cursor-pointer"
            style={{
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "140px",
              height: "130px",
              zIndex: 26,
              borderRadius: "12px",
              border: "3px solid #FFD700",
              boxShadow: "0 0 30px rgba(255,215,0,0.8)",
              animation: "btnPulse 1.5s ease-in-out infinite",
            }}
            onClick={() => setStep("room_select")}
          />
        </>
      )}

      <StepIndicator step={showGameHighlight ? "lobby_game" : "lobby"} />
    </div>
  );

  // ---- Step 2: 活动面板弹窗 ----
  const renderActivityPanel = () => (
    <div className="relative w-full h-full overflow-hidden">
      {/* 底图 */}
      <img
        src="/manus-storage/lobby-bg_ddb0d8a4.webp"
        alt="背景"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* 遮罩 */}
      <div className="absolute inset-0 game-overlay" />

      {/* 活动面板弹窗 */}
      <div
        className="absolute inset-x-4 game-panel animate-modal-in"
        style={{
          top: "50%",
          transform: "translateY(-50%)",
          maxHeight: "88vh",
          overflowY: "auto",
          zIndex: 50,
          padding: "0",
        }}
      >
        {/* 弹窗顶部标题栏 */}
        <div
          style={{
            background: "linear-gradient(180deg, #8B0000 0%, #5A0000 100%)",
            borderBottom: "2px solid #8B6914",
            padding: "14px 20px 10px",
            borderRadius: "10px 10px 0 0",
            position: "relative",
          }}
        >
          {/* 装饰性角标 */}
          <div style={{ position: "absolute", left: "16px", top: "12px", fontSize: "24px" }}>🏆</div>
          <div style={{ position: "absolute", right: "16px", top: "12px", fontSize: "24px" }}>🏆</div>

          <div className="text-center">
            <div
              style={{
                fontSize: "11px",
                color: "#FFD700",
                letterSpacing: "4px",
                fontWeight: 600,
                marginBottom: "2px",
              }}
            >
              ✦ 五一狂欢 ✦
            </div>
            <div
              className="animate-gold-sweep"
              style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "2px" }}
            >
              全民挖金矿
            </div>
            <div style={{ fontSize: "11px", color: "#FFA07A", marginTop: "2px" }}>
              活动时间：2025年5月1日 - 5月7日
            </div>
          </div>

          {/* 关闭按钮 */}
          <button
            onClick={() => setStep("lobby")}
            style={{
              position: "absolute",
              right: "12px",
              top: "12px",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "rgba(0,0,0,0.5)",
              border: "1px solid #666",
              color: "#CCC",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* 我的金铲子状态 */}
        <div style={{ padding: "12px 16px", background: "rgba(0,0,0,0.3)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(139, 105, 20, 0.15)",
              border: "1px solid rgba(139, 105, 20, 0.5)",
              borderRadius: "10px",
              padding: "10px 16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "28px" }}>⛏️</span>
              <div>
                <div style={{ fontSize: "12px", color: "#AAA", marginBottom: "2px" }}>我的金铲子</div>
                <div style={{ fontSize: "26px", fontWeight: 900, color: "#FFD700", fontFamily: "monospace" }}>
                  {shovelCount}
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", color: "#AAA", marginBottom: "4px" }}>今日掉落进度</div>
              <div style={{ fontSize: "13px", color: "#FFD700", fontWeight: 700, marginBottom: "6px" }}>
                {shovelCount} / 100
              </div>
              {/* 进度条 */}
              <div
                style={{
                  width: "120px",
                  height: "8px",
                  background: "rgba(0,0,0,0.5)",
                  borderRadius: "4px",
                  border: "1px solid rgba(139,105,20,0.4)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(shovelCount, 100)}%`,
                    background: shovelCount === 0
                      ? "transparent"
                      : "linear-gradient(90deg, #FFD700 0%, #FF8C00 100%)",
                    borderRadius: "4px",
                    boxShadow: shovelCount > 0 ? "0 0 8px rgba(255,215,0,0.6)" : "none",
                    transition: "width 0.8s ease",
                  }}
                />
              </div>
              {shovelCount === 0 && (
                <div style={{ fontSize: "10px", color: "#666", marginTop: "3px" }}>
                  空槽 · 快去打牌赚铲子
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 活动规则说明 */}
        <div style={{ padding: "0 16px 10px" }}>
          <div
            style={{
              background: "rgba(139, 105, 20, 0.1)",
              border: "1px solid rgba(139, 105, 20, 0.3)",
              borderRadius: "8px",
              padding: "10px 14px",
              fontSize: "12px",
              color: "#CCA050",
              lineHeight: 1.8,
            }}
          >
            <div style={{ color: "#FFD700", fontWeight: 700, marginBottom: "4px", fontSize: "13px" }}>
              📜 活动规则
            </div>
            <div>· 五一期间每局牌局均可随机掉落金铲子</div>
            <div>· 初级高手场掉落倍率 <span style={{ color: "#FF8C00", fontWeight: 700 }}>×3</span>，普通场 ×1</div>
            <div>· 每日最多累积 100 把金铲子</div>
            <div>· 金铲子可在本活动商店兑换专属奖励</div>
          </div>
        </div>

        {/* 奖励列表 */}
        <div style={{ padding: "0 16px 12px" }}>
          <div style={{ color: "#FFD700", fontWeight: 700, fontSize: "14px", marginBottom: "10px" }}>
            🎁 活动奖励
          </div>

          {/* 新手专享礼包 */}
          <div
            className="reward-card"
            style={{
              padding: "12px",
              marginBottom: "8px",
              border: shovelCount >= 3 ? "2px solid #FFD700" : "1px solid rgba(139,105,20,0.4)",
              boxShadow: shovelCount >= 3 ? "0 0 16px rgba(255,215,0,0.4)" : "none",
              transition: "all 0.3s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #4A1A00 0%, #8B3A00 100%)",
                    border: "1px solid #8B6914",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                  }}
                >
                  🎓
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFF8DC" }}>
                      新手破冰礼包
                    </span>
                    <span className="newbie-badge">新手专享</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#CCA050" }}>5万悟性 · 限首次兑换</div>
                  <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
                    需要：<span style={{ color: "#FFD700" }}>⛏️ 3把</span>
                  </div>
                </div>
              </div>
              <button
                className={shovelCount >= 3 && !exchanged ? "game-btn-gold animate-btn-pulse" : "game-btn-disabled"}
                style={{ padding: "8px 16px", fontSize: "13px", minWidth: "64px" }}
                onClick={() => {
                  if (shovelCount >= 3 && !exchanged) setStep("activity_shop");
                }}
                disabled={shovelCount < 3 || exchanged}
              >
                {exchanged ? "已兑换" : "兑换"}
              </button>
            </div>
          </div>

          {/* 五一劳模称号 */}
          <div className="reward-card" style={{ padding: "12px", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #1A1A4A 0%, #3A3A8B 100%)",
                    border: "1px solid #8B6914",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                  }}
                >
                  🏅
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#FFF8DC", marginBottom: "3px" }}>
                    「五一劳模」专属称号
                  </div>
                  <div style={{ fontSize: "12px", color: "#CCA050" }}>永久称号 · 全服展示</div>
                  <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
                    需要：<span style={{ color: "#FFD700" }}>⛏️ 50把</span>
                  </div>
                </div>
              </div>
              <button className="game-btn-disabled" style={{ padding: "8px 16px", fontSize: "13px", minWidth: "64px" }} disabled>
                兑换
              </button>
            </div>
          </div>

          {/* 20万悟性包 */}
          <div className="reward-card" style={{ padding: "12px", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #1A3A1A 0%, #3A8B3A 100%)",
                    border: "1px solid #8B6914",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                  }}
                >
                  💰
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#FFF8DC", marginBottom: "3px" }}>
                    20万悟性大礼包
                  </div>
                  <div style={{ fontSize: "12px", color: "#CCA050" }}>悟性 ×200,000</div>
                  <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
                    需要：<span style={{ color: "#FFD700" }}>⛏️ 100把</span>
                  </div>
                </div>
              </div>
              <button className="game-btn-disabled" style={{ padding: "8px 16px", fontSize: "13px", minWidth: "64px" }} disabled>
                兑换
              </button>
            </div>
          </div>

          {/* 专属头像框 */}
          <div className="reward-card" style={{ padding: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #3A1A00 0%, #8B4500 100%)",
                    border: "1px solid #8B6914",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                  }}
                >
                  🖼️
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#FFF8DC", marginBottom: "3px" }}>
                    矿工专属头像框
                  </div>
                  <div style={{ fontSize: "12px", color: "#CCA050" }}>30天 · 限定款</div>
                  <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
                    需要：<span style={{ color: "#FFD700" }}>⛏️ 80把</span>
                  </div>
                </div>
              </div>
              <button className="game-btn-disabled" style={{ padding: "8px 16px", fontSize: "13px", minWidth: "64px" }} disabled>
                兑换
              </button>
            </div>
          </div>
        </div>

        {/* 底部 CTA 按钮 */}
        <div style={{ padding: "0 16px 16px" }}>
          <button
            className="game-btn-primary w-full"
            style={{
              padding: "14px",
              fontSize: "16px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
            onClick={() => setStep("miner_recommend")}
          >
            <span
              style={{ fontSize: "20px", animation: "fingerTap 1.2s ease-in-out infinite" }}
            >
              👆
            </span>
            去打牌赚铲子 &gt;
          </button>
        </div>
      </div>

      <StepIndicator step="activity_panel" />
    </div>
  );

  // ---- Step 2b: 矿工推荐模态框 ----
  const renderMinerRecommend = () => (
    <div className="relative w-full h-full overflow-hidden">
      <img
        src="/manus-storage/lobby-bg_ddb0d8a4.webp"
        alt="背景"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 game-overlay" />

      {/* 模态框 */}
      <div
        className="absolute game-panel animate-modal-in"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "88%",
          maxWidth: "360px",
          zIndex: 60,
          padding: "0",
          overflow: "hidden",
        }}
      >
        {/* 标题 */}
        <div
          style={{
            background: "linear-gradient(180deg, #6B3A00 0%, #3D1A00 100%)",
            borderBottom: "2px solid #8B6914",
            padding: "14px 20px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "24px", marginBottom: "4px" }}>⛏️</div>
          <div
            className="animate-gold-sweep"
            style={{ fontSize: "18px", fontWeight: 900 }}
          >
            矿工老手推荐
          </div>
        </div>

        {/* 内容 */}
        <div style={{ padding: "16px 20px" }}>
          {/* 矿工角色 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
              background: "rgba(139, 105, 20, 0.1)",
              border: "1px solid rgba(139, 105, 20, 0.3)",
              borderRadius: "10px",
              padding: "12px",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #8B3A00 0%, #CC6600 100%)",
                border: "2px solid #FFD700",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                flexShrink: 0,
              }}
            >
              👷
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#FFD700", marginBottom: "4px" }}>
                老矿工张大叔
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#FFF8DC",
                  lineHeight: 1.6,
                  background: "rgba(0,0,0,0.3)",
                  borderRadius: "8px",
                  padding: "8px 10px",
                  borderLeft: "3px solid #FFD700",
                }}
              >
                "新来的兄弟！去玩<span style={{ color: "#FF8C00", fontWeight: 700 }}>初级高手场</span>，铲子掉落是普通场的 <span style={{ color: "#FFD700", fontWeight: 900, fontSize: "16px" }}>3倍</span>！挖矿就要挖最值钱的！"
              </div>
            </div>
          </div>

          {/* 推荐卡片 */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(139,58,0,0.3) 0%, rgba(61,26,0,0.5) 100%)",
              border: "2px solid #FF8C00",
              borderRadius: "10px",
              padding: "12px 16px",
              marginBottom: "16px",
              boxShadow: "0 0 20px rgba(255,140,0,0.3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "16px" }}>🎮</span>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "#FFF8DC" }}>
                    三打哈 · 初级高手场
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#CCA050" }}>
                  底注：500 · 最低入场：5,000
                </div>
              </div>
              <div
                style={{
                  background: "linear-gradient(135deg, #FF4500 0%, #FF8C00 100%)",
                  border: "1px solid #FFD700",
                  borderRadius: "6px",
                  padding: "4px 10px",
                  fontSize: "13px",
                  fontWeight: 800,
                  color: "#FFF",
                  textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                🔥 铲子 ×3
              </div>
            </div>
          </div>

          {/* 按钮组 */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              style={{
                flex: 1,
                padding: "11px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                color: "#AAA",
                fontSize: "14px",
              }}
              onClick={() => setStep("activity_panel")}
            >
              再看看
            </button>
            <button
              className="game-btn-primary"
              style={{ flex: 2, padding: "11px", fontSize: "14px", borderRadius: "8px" }}
              onClick={() => setStep("lobby_game")}
            >
              好的，出发！🚀
            </button>
          </div>
        </div>
      </div>

      <StepIndicator step="miner_recommend" />
    </div>
  );

  // ---- Step 3b: 场次选择 ----
  const renderRoomSelect = () => (
    <div className="relative w-full h-full overflow-hidden">
      <img
        src="/manus-storage/lobby-bg_ddb0d8a4.webp"
        alt="背景"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 game-overlay" />

      {/* 场次选择弹窗 */}
      <div
        className="absolute game-panel animate-modal-in"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "92%",
          maxWidth: "400px",
          zIndex: 50,
          padding: "0",
          overflow: "hidden",
        }}
      >
        {/* 标题 */}
        <div
          style={{
            background: "linear-gradient(180deg, #8B0000 0%, #5A0000 100%)",
            borderBottom: "2px solid #8B6914",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={() => setStep("lobby_game")}
            style={{
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "6px",
              color: "#CCC",
              padding: "4px 10px",
              fontSize: "13px",
            }}
          >
            ← 返回
          </button>
          <div className="text-center">
            <div style={{ fontSize: "18px", fontWeight: 900, color: "#FFD700" }}>
              🎴 三打哈
            </div>
            <div style={{ fontSize: "11px", color: "#CCA050" }}>选择场次</div>
          </div>
          <div style={{ width: "52px" }} />
        </div>

        {/* 场次列表 */}
        <div style={{ padding: "14px 16px" }}>
          {/* 初级高手场 - 推荐 */}
          <div
            className="room-card featured cursor-pointer"
            style={{
              padding: "14px 16px",
              marginBottom: "10px",
              animation: "cardSlideIn 0.3s ease-out 0.1s both",
              position: "relative",
              overflow: "hidden",
            }}
            onClick={() => setStep("playing")}
          >
            {/* 推荐光效 */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: "linear-gradient(90deg, transparent, #FF8C00, transparent)",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 800, color: "#FFF8DC" }}>
                    初级高手场
                  </span>
                  {/* 铲子倍率角标 */}
                  <div
                    style={{
                      background: "linear-gradient(135deg, #FF4500 0%, #FF8C00 100%)",
                      border: "1px solid #FFD700",
                      borderRadius: "4px",
                      padding: "2px 8px",
                      fontSize: "12px",
                      fontWeight: 800,
                      color: "#FFF",
                      boxShadow: "0 0 8px rgba(255,140,0,0.5)",
                    }}
                  >
                    🔥 铲子掉落 ×3
                  </div>
                </div>
                <div style={{ fontSize: "12px", color: "#CCA050", marginBottom: "4px" }}>
                  底注：500 · 入场：5,000 起
                </div>
                <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "#888" }}>
                  <span>👥 在线：1,247</span>
                  <span>🃏 桌数：312</span>
                </div>
              </div>
              <button
                className="game-btn-primary"
                style={{ padding: "10px 18px", fontSize: "14px", borderRadius: "8px", flexShrink: 0 }}
              >
                进入
              </button>
            </div>
          </div>

          {/* 普通场 */}
          <div
            className="room-card"
            style={{
              padding: "14px 16px",
              marginBottom: "10px",
              animation: "cardSlideIn 0.3s ease-out 0.2s both",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "#FFF8DC" }}>普通场</span>
                  <div
                    style={{
                      background: "rgba(100,100,100,0.5)",
                      border: "1px solid #555",
                      borderRadius: "4px",
                      padding: "2px 8px",
                      fontSize: "12px",
                      color: "#888",
                    }}
                  >
                    铲子掉落 ×1
                  </div>
                </div>
                <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>
                  底注：100 · 入场：1,000 起
                </div>
                <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "#666" }}>
                  <span>👥 在线：3,891</span>
                  <span>🃏 桌数：972</span>
                </div>
              </div>
              <button
                style={{
                  padding: "10px 18px",
                  fontSize: "14px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#CCC",
                }}
                onClick={() => setStep("playing")}
              >
                进入
              </button>
            </div>
          </div>

          {/* 高级场 */}
          <div
            className="room-card"
            style={{
              padding: "14px 16px",
              animation: "cardSlideIn 0.3s ease-out 0.3s both",
              opacity: 0.7,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "#FFF8DC" }}>高级场</span>
                  <div
                    style={{
                      background: "rgba(100,100,100,0.5)",
                      border: "1px solid #555",
                      borderRadius: "4px",
                      padding: "2px 8px",
                      fontSize: "12px",
                      color: "#888",
                    }}
                  >
                    铲子掉落 ×2
                  </div>
                </div>
                <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>
                  底注：2,000 · 入场：20,000 起
                </div>
                <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "#666" }}>
                  <span>👥 在线：456</span>
                  <span>🃏 桌数：114</span>
                </div>
              </div>
              <button
                style={{
                  padding: "10px 18px",
                  fontSize: "14px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#888",
                }}
                onClick={() => setStep("playing")}
              >
                进入
              </button>
            </div>
          </div>
        </div>
      </div>

      <StepIndicator step="room_select" />
    </div>
  );

  // ---- 打牌中（过渡页） ----
  const renderPlaying = () => (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center"
      style={{
        background: "radial-gradient(ellipse at center, #1A4A00 0%, #0D2800 50%, #061400 100%)",
      }}
    >
      {/* 牌桌 */}
      <div
        style={{
          width: "280px",
          height: "180px",
          borderRadius: "90px",
          background: "radial-gradient(ellipse, #2D7A00 0%, #1A4A00 60%, #0D2800 100%)",
          border: "8px solid #5A3A00",
          boxShadow: "0 0 40px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,0,0,0.4)",
          position: "relative",
          marginBottom: "32px",
        }}
      >
        {/* 牌 */}
        {["♠A", "♥K", "♦Q", "♣J", "♠10"].map((card, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: "36px",
              height: "52px",
              background: "#FFF",
              borderRadius: "4px",
              border: "1px solid #CCC",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: 700,
              color: card.includes("♥") || card.includes("♦") ? "#CC0000" : "#1A1A1A",
              left: `${30 + i * 44}px`,
              top: "64px",
              transform: `rotate(${(i - 2) * 5}deg)`,
              boxShadow: "2px 2px 6px rgba(0,0,0,0.4)",
            }}
          >
            {card}
          </div>
        ))}
      </div>

      <div style={{ color: "#FFD700", fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
        牌局进行中...
      </div>
      <div style={{ color: "#888", fontSize: "13px", marginBottom: "32px" }}>
        三打哈 · 初级高手场
      </div>

      <button
        className="game-btn-gold"
        style={{ padding: "14px 40px", fontSize: "16px", borderRadius: "10px" }}
        onClick={() => {
          setShovelCount(3);
          setStep("victory");
        }}
      >
        🏆 结束牌局（模拟胜利）
      </button>

      <StepIndicator step="playing" />
    </div>
  );

  // ---- Step 4: 胜利结算 ----
  const renderVictory = () => (
    <div className="relative w-full h-full overflow-hidden">
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 30%, #3A1A00 0%, #1A0800 50%, #0A0400 100%)",
        }}
      />

      {/* 金光背景粒子 */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            borderRadius: "50%",
            background: i % 3 === 0 ? "#FFD700" : i % 3 === 1 ? "#FF8C00" : "#FFF8DC",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.6 + 0.2,
            animation: `sparkle ${Math.random() * 2 + 1}s ease-out ${Math.random() * 2}s infinite`,
            "--tx": `${(Math.random() - 0.5) * 100}px`,
            "--ty": `${-(Math.random() * 100 + 20)}px`,
          } as React.CSSProperties}
        />
      ))}

      {/* 胜利弹窗 */}
      <div
        className="absolute victory-panel animate-modal-in"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "92%",
          maxWidth: "380px",
          zIndex: 50,
          padding: "0",
          overflow: "hidden",
        }}
      >
        {/* VICTORY 标题 */}
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            background: "linear-gradient(180deg, rgba(255,215,0,0.15) 0%, transparent 100%)",
            borderBottom: "1px solid rgba(255,215,0,0.2)",
          }}
        >
          {/* 星星装饰 */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  fontSize: "28px",
                  animation: `victoryStarBurst 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.15}s both`,
                }}
              >
                ⭐
              </div>
            ))}
          </div>
          <div
            style={{
              fontSize: "32px",
              fontWeight: 900,
              background: "linear-gradient(180deg, #FFF8DC 0%, #FFD700 50%, #FF8C00 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "4px",
              textShadow: "none",
              filter: "drop-shadow(0 2px 8px rgba(255,215,0,0.5))",
            }}
          >
            VICTORY
          </div>
          <div style={{ fontSize: "13px", color: "#CCA050", marginTop: "4px" }}>
            三打哈 · 初级高手场 · 第1局
          </div>
        </div>

        {/* 金币结算 */}
        <div style={{ padding: "16px 20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
              padding: "8px 12px",
              background: "rgba(255,215,0,0.05)",
              borderRadius: "8px",
            }}
          >
            <span style={{ color: "#888", fontSize: "13px" }}>本局金币</span>
            <span style={{ color: "#FFD700", fontWeight: 700, fontSize: "15px" }}>+2,450 💰</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "16px",
              padding: "8px 12px",
              background: "rgba(255,215,0,0.05)",
              borderRadius: "8px",
            }}
          >
            <span style={{ color: "#888", fontSize: "13px" }}>悟性奖励</span>
            <span style={{ color: "#4ADE80", fontWeight: 700, fontSize: "15px" }}>+800 ✨</span>
          </div>

          {/* 金铲子掉落 - 核心正反馈 */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(139,58,0,0.4) 0%, rgba(61,26,0,0.6) 100%)",
              border: "2px solid #FF8C00",
              borderRadius: "12px",
              padding: "16px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 0 30px rgba(255,140,0,0.3)",
            }}
          >
            {/* 光效 */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: "linear-gradient(90deg, transparent, #FFD700, transparent)",
              }}
            />

            <div style={{ fontSize: "13px", color: "#CCA050", marginBottom: "8px" }}>
              🎉 恭喜获得首批挖矿工具！
            </div>

            {/* 铲子飞出区域 */}
            <div style={{ position: "relative", height: "60px", marginBottom: "8px" }}>
              {showShovelFly && (
                <ShovelFlyAnimation onDone={() => setShowShovelFly(false)} />
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "12px",
                  paddingTop: "8px",
                }}
              >
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: "32px",
                      animation: showVictoryNumber
                        ? `numberPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.1}s both`
                        : "none",
                      filter: "drop-shadow(0 0 8px #FFD700)",
                    }}
                  >
                    ⛏️
                  </div>
                ))}
              </div>
            </div>

            {/* 数字跳动 */}
            <div
              style={{
                fontSize: "28px",
                fontWeight: 900,
                color: "#FFD700",
                fontFamily: "monospace",
                textShadow: "0 0 20px rgba(255,215,0,0.8)",
                marginBottom: "6px",
              }}
            >
              {showVictoryNumber ? (
                <span style={{ animation: "numberPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both" }}>
                  +3 ⛏️
                </span>
              ) : (
                "+0 ⛏️"
              )}
            </div>

            {/* 今日进度 */}
            <div style={{ fontSize: "13px", color: "#FF8C00", fontWeight: 600, marginBottom: "10px" }}>
              今日进度：{showProgress ? "3" : "0"} / 100
            </div>

            {/* 进度条 */}
            <div
              style={{
                height: "8px",
                background: "rgba(0,0,0,0.5)",
                borderRadius: "4px",
                border: "1px solid rgba(139,105,20,0.4)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: showProgress ? "3%" : "0%",
                  background: "linear-gradient(90deg, #FFD700 0%, #FF8C00 100%)",
                  borderRadius: "4px",
                  boxShadow: "0 0 8px rgba(255,215,0,0.6)",
                  transition: "width 1s ease-out 0.5s",
                }}
              />
            </div>
          </div>
        </div>

        {/* 按钮组 */}
        <div style={{ padding: "0 20px 20px", display: "flex", gap: "10px" }}>
          <button
            style={{
              flex: 1,
              padding: "12px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "8px",
              color: "#CCC",
              fontSize: "14px",
            }}
            onClick={() => setStep("room_select")}
          >
            再来一局
          </button>
          <button
            className="game-btn-gold animate-btn-pulse"
            style={{ flex: 2, padding: "12px", fontSize: "14px", borderRadius: "8px" }}
            onClick={() => setStep("activity_shop")}
          >
            立即去兑换 →
          </button>
        </div>
      </div>

      <StepIndicator step="victory" />
    </div>
  );

  // ---- Step 5: 活动商店（有3铲子，可兑换） ----
  const renderActivityShop = () => (
    <div className="relative w-full h-full overflow-hidden">
      <img
        src="/manus-storage/lobby-bg_ddb0d8a4.webp"
        alt="背景"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 game-overlay" />

      {/* 活动面板弹窗 */}
      <div
        className="absolute inset-x-4 game-panel animate-modal-in"
        style={{
          top: "50%",
          transform: "translateY(-50%)",
          maxHeight: "88vh",
          overflowY: "auto",
          zIndex: 50,
          padding: "0",
        }}
      >
        {/* 弹窗顶部标题栏 */}
        <div
          style={{
            background: "linear-gradient(180deg, #8B0000 0%, #5A0000 100%)",
            borderBottom: "2px solid #8B6914",
            padding: "14px 20px 10px",
            borderRadius: "10px 10px 0 0",
            position: "relative",
          }}
        >
          <div style={{ position: "absolute", left: "16px", top: "12px", fontSize: "24px" }}>🏆</div>
          <div style={{ position: "absolute", right: "16px", top: "12px", fontSize: "24px" }}>🏆</div>

          <div className="text-center">
            <div style={{ fontSize: "11px", color: "#FFD700", letterSpacing: "4px", fontWeight: 600, marginBottom: "2px" }}>
              ✦ 五一狂欢 ✦
            </div>
            <div
              className="animate-gold-sweep"
              style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "2px" }}
            >
              全民挖金矿
            </div>
            <div style={{ fontSize: "11px", color: "#FFA07A", marginTop: "2px" }}>
              活动时间：2025年5月1日 - 5月7日
            </div>
          </div>

          <button
            onClick={() => setStep("lobby")}
            style={{
              position: "absolute",
              right: "12px",
              top: "12px",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "rgba(0,0,0,0.5)",
              border: "1px solid #666",
              color: "#CCC",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        {/* 我的金铲子状态 - 现在有3把 */}
        <div style={{ padding: "12px 16px", background: "rgba(0,0,0,0.3)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: exchanged
                ? "rgba(100,100,100,0.1)"
                : "rgba(255,215,0,0.12)",
              border: exchanged
                ? "1px solid rgba(100,100,100,0.3)"
                : "1px solid rgba(255,215,0,0.5)",
              borderRadius: "10px",
              padding: "10px 16px",
              boxShadow: exchanged ? "none" : "0 0 16px rgba(255,215,0,0.2)",
              transition: "all 0.5s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "28px" }}>⛏️</span>
              <div>
                <div style={{ fontSize: "12px", color: "#AAA", marginBottom: "2px" }}>我的金铲子</div>
                <div
                  style={{
                    fontSize: "26px",
                    fontWeight: 900,
                    color: exchanged ? "#888" : "#FFD700",
                    fontFamily: "monospace",
                    transition: "color 0.5s ease",
                    animation: !exchanged ? "numberPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both" : "none",
                  }}
                >
                  {exchanged ? 0 : 3}
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", color: "#AAA", marginBottom: "4px" }}>今日掉落进度</div>
              <div style={{ fontSize: "13px", color: exchanged ? "#888" : "#FFD700", fontWeight: 700, marginBottom: "6px" }}>
                {exchanged ? "0" : "3"} / 100
              </div>
              <div
                style={{
                  width: "120px",
                  height: "8px",
                  background: "rgba(0,0,0,0.5)",
                  borderRadius: "4px",
                  border: "1px solid rgba(139,105,20,0.4)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: exchanged ? "0%" : "3%",
                    background: "linear-gradient(90deg, #FFD700 0%, #FF8C00 100%)",
                    borderRadius: "4px",
                    boxShadow: "0 0 8px rgba(255,215,0,0.6)",
                    transition: "width 0.8s ease",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 活动规则说明 */}
        <div style={{ padding: "0 16px 10px" }}>
          <div
            style={{
              background: "rgba(139, 105, 20, 0.1)",
              border: "1px solid rgba(139, 105, 20, 0.3)",
              borderRadius: "8px",
              padding: "10px 14px",
              fontSize: "12px",
              color: "#CCA050",
              lineHeight: 1.8,
            }}
          >
            <div style={{ color: "#FFD700", fontWeight: 700, marginBottom: "4px", fontSize: "13px" }}>
              📜 活动规则
            </div>
            <div>· 五一期间每局牌局均可随机掉落金铲子</div>
            <div>· 初级高手场掉落倍率 <span style={{ color: "#FF8C00", fontWeight: 700 }}>×3</span>，普通场 ×1</div>
            <div>· 每日最多累积 100 把金铲子</div>
            <div>· 金铲子可在本活动商店兑换专属奖励</div>
          </div>
        </div>

        {/* 奖励列表 */}
        <div style={{ padding: "0 16px 12px" }}>
          <div style={{ color: "#FFD700", fontWeight: 700, fontSize: "14px", marginBottom: "10px" }}>
            🎁 活动奖励
          </div>

          {/* 新手专享礼包 - 高亮可兑换 */}
          <div
            className="reward-card"
            style={{
              padding: "12px",
              marginBottom: "8px",
              border: !exchanged ? "2px solid #FFD700" : "1px solid rgba(100,100,100,0.3)",
              boxShadow: !exchanged ? "0 0 20px rgba(255,215,0,0.4)" : "none",
              background: !exchanged
                ? "linear-gradient(135deg, rgba(139,105,20,0.2) 0%, rgba(61,26,0,0.9) 100%)"
                : "rgba(50,50,50,0.5)",
              transition: "all 0.5s ease",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* 高亮扫光效果 */}
            {!exchanged && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "60%",
                  height: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(255,215,0,0.1), transparent)",
                  animation: "goldSweep 2s linear infinite",
                  backgroundSize: "200% auto",
                }}
              />
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "8px",
                    background: exchanged
                      ? "rgba(50,50,50,0.5)"
                      : "linear-gradient(135deg, #4A1A00 0%, #8B3A00 100%)",
                    border: exchanged ? "1px solid #444" : "1px solid #8B6914",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    opacity: exchanged ? 0.5 : 1,
                    transition: "all 0.5s ease",
                  }}
                >
                  🎓
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: exchanged ? "#666" : "#FFF8DC",
                        transition: "color 0.5s ease",
                      }}
                    >
                      新手破冰礼包
                    </span>
                    {!exchanged && <span className="newbie-badge">新手专享</span>}
                    {exchanged && (
                      <span
                        style={{
                          background: "rgba(100,100,100,0.3)",
                          border: "1px solid #555",
                          borderRadius: "4px",
                          padding: "2px 8px",
                          fontSize: "11px",
                          color: "#666",
                        }}
                      >
                        已兑换
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "12px", color: exchanged ? "#555" : "#CCA050" }}>
                    5万悟性 · 限首次兑换
                  </div>
                  <div style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>
                    需要：<span style={{ color: exchanged ? "#555" : "#FFD700" }}>⛏️ 3把</span>
                  </div>
                </div>
              </div>
              <button
                className={!exchanged ? "game-btn-gold animate-btn-pulse" : "game-btn-disabled"}
                style={{ padding: "8px 16px", fontSize: "13px", minWidth: "64px" }}
                disabled={exchanged}
                onClick={() => {
                  if (!exchanged) {
                    setExchanged(true);
                    setShovelCount(0);
                    triggerToast("✅ 兑换成功！5万悟性已到账");
                  }
                }}
              >
                {exchanged ? "已兑换" : "兑换"}
              </button>
            </div>
          </div>

          {/* 五一劳模称号 */}
          <div className="reward-card" style={{ padding: "12px", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #1A1A4A 0%, #3A3A8B 100%)",
                    border: "1px solid #8B6914",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                  }}
                >
                  🏅
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#FFF8DC", marginBottom: "3px" }}>
                    「五一劳模」专属称号
                  </div>
                  <div style={{ fontSize: "12px", color: "#CCA050" }}>永久称号 · 全服展示</div>
                  <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
                    需要：<span style={{ color: "#FFD700" }}>⛏️ 50把</span>
                  </div>
                </div>
              </div>
              <button className="game-btn-disabled" style={{ padding: "8px 16px", fontSize: "13px", minWidth: "64px" }} disabled>
                兑换
              </button>
            </div>
          </div>

          {/* 20万悟性包 */}
          <div className="reward-card" style={{ padding: "12px", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #1A3A1A 0%, #3A8B3A 100%)",
                    border: "1px solid #8B6914",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                  }}
                >
                  💰
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#FFF8DC", marginBottom: "3px" }}>
                    20万悟性大礼包
                  </div>
                  <div style={{ fontSize: "12px", color: "#CCA050" }}>悟性 ×200,000</div>
                  <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
                    需要：<span style={{ color: "#FFD700" }}>⛏️ 100把</span>
                  </div>
                </div>
              </div>
              <button className="game-btn-disabled" style={{ padding: "8px 16px", fontSize: "13px", minWidth: "64px" }} disabled>
                兑换
              </button>
            </div>
          </div>

          {/* 专属头像框 */}
          <div className="reward-card" style={{ padding: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #3A1A00 0%, #8B4500 100%)",
                    border: "1px solid #8B6914",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                  }}
                >
                  🖼️
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#FFF8DC", marginBottom: "3px" }}>
                    矿工专属头像框
                  </div>
                  <div style={{ fontSize: "12px", color: "#CCA050" }}>30天 · 限定款</div>
                  <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
                    需要：<span style={{ color: "#FFD700" }}>⛏️ 80把</span>
                  </div>
                </div>
              </div>
              <button className="game-btn-disabled" style={{ padding: "8px 16px", fontSize: "13px", minWidth: "64px" }} disabled>
                兑换
              </button>
            </div>
          </div>
        </div>

        {/* 底部提示 */}
        {exchanged && (
          <div
            style={{
              margin: "0 16px 16px",
              padding: "12px 16px",
              background: "rgba(74, 222, 128, 0.1)",
              border: "1px solid rgba(74, 222, 128, 0.3)",
              borderRadius: "10px",
              textAlign: "center",
              animation: "modalSlideIn 0.4s ease-out forwards",
            }}
          >
            <div style={{ fontSize: "20px", marginBottom: "6px" }}>🎉</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#4ADE80", marginBottom: "4px" }}>
              破冰成功！继续挖矿解锁更多奖励
            </div>
            <div style={{ fontSize: "12px", color: "#888" }}>
              继续打牌累积铲子，解锁「五一劳模」称号等大奖！
            </div>
            <button
              className="game-btn-primary"
              style={{ marginTop: "12px", padding: "10px 24px", fontSize: "14px", borderRadius: "8px" }}
              onClick={() => {
                setShovelCount(0);
                setExchanged(false);
                setStep("lobby");
              }}
            >
              返回大厅继续挖矿 ⛏️
            </button>
          </div>
        )}
      </div>

      <StepIndicator step="activity_shop" />
    </div>
  );

  // ===== 主渲染 =====
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        background: "#0A0400",
        fontFamily: '"PingFang SC", "Microsoft YaHei", "微软雅黑", system-ui, sans-serif',
      }}
    >
      {/* 主内容区域 */}
      <div style={{ width: "100%", height: "100%" }}>
        {step === "lobby" && renderLobby(false)}
        {step === "activity_panel" && renderActivityPanel()}
        {step === "miner_recommend" && renderMinerRecommend()}
        {step === "lobby_game" && renderLobby(true)}
        {step === "room_select" && renderRoomSelect()}
        {step === "playing" && renderPlaying()}
        {step === "victory" && renderVictory()}
        {step === "activity_shop" && renderActivityShop()}
      </div>

      {/* 全局 Toast */}
      <GameToast message={toastMessage} visible={showToast} />

      {/* 底部导航指引（所有页面均显示，用于原型演示） */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100,
          display: "flex",
          gap: "5px",
          alignItems: "center",
          background: "rgba(0,0,0,0.7)",
          border: "1px solid rgba(255,215,0,0.2)",
          borderRadius: "20px",
          padding: "5px 10px",
          backdropFilter: "blur(8px)",
        }}
      >
        <span style={{ fontSize: "9px", color: "rgba(255,215,0,0.5)", marginRight: "2px", whiteSpace: "nowrap" }}>原型导航：</span>
        {["①大厅", "②活动面板", "③矿工推荐", "④场次选择", "⑤牌局", "⑥胜利结算", "⑦活动商店"].map((label, i) => {
          const stepKeys: GameStep[] = [
            "lobby", "activity_panel", "miner_recommend",
            "room_select", "playing", "victory", "activity_shop"
          ];
          const isActive = step === stepKeys[i];
          return (
            <button
              key={i}
              onClick={() => {
                if (i === 5) { setShovelCount(3); setExchanged(false); }
                if (i === 6) { setShovelCount(3); setExchanged(false); }
                setStep(stepKeys[i]);
              }}
              style={{
                padding: "3px 7px",
                borderRadius: "10px",
                fontSize: "10px",
                fontWeight: isActive ? 700 : 400,
                background: isActive ? "rgba(255,215,0,0.3)" : "transparent",
                border: isActive ? "1px solid #FFD700" : "1px solid transparent",
                color: isActive ? "#FFD700" : "rgba(255,255,255,0.5)",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
