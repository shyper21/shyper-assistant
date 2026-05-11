export default function JarvisAvatar({ state }) {
  const isIdle = state === 'idle'
  const isListening = state === 'listening'
  const isProcessing = state === 'processing'
  const isSpeaking = state === 'speaking'

  // Eye open amount per state
  const eyeRy = isListening ? 13 : isSpeaking ? 11 : isProcessing ? 10 : 7

  return (
    <>
      <div className={`av-wrap av-${state}`}>
        {/* Aura rings */}
        <div className="av-aura av-aura-2" />
        <div className="av-aura av-aura-1" />

        <svg viewBox="0 0 200 240" width="160" height="192" className="av-svg" aria-hidden="true">
          {/* ── Hair back ── */}
          <ellipse cx="100" cy="62" rx="58" ry="32" fill="#130a24" />
          <polygon points="100,16 83,60 117,60" fill="#130a24" />
          <polygon points="74,22 56,64 86,62" fill="#130a24" />
          <polygon points="126,22 144,64 114,62" fill="#130a24" />
          <polygon points="52,40 38,74 66,70" fill="#130a24" />
          <polygon points="148,40 162,74 134,70" fill="#130a24" />

          {/* ── Face ── */}
          <ellipse cx="100" cy="138" rx="62" ry="76" fill="#f2e8d8" />

          {/* ── Side hair ── */}
          <path d="M38,108 Q26,138 36,172 Q50,170 55,150 Q44,130 42,108 Z" fill="#130a24" />
          <path d="M162,108 Q174,138 164,172 Q150,170 145,150 Q156,130 158,108 Z" fill="#130a24" />

          {/* ── Hair front ── */}
          <ellipse cx="100" cy="70" rx="55" ry="26" fill="#1a0d2e" />

          {/* ── Eyebrows ── */}
          <path
            d={isProcessing ? "M58,102 Q74,95 90,102" : "M58,107 Q74,101 90,107"}
            stroke="#2a1540" strokeWidth="2.5" fill="none" strokeLinecap="round"
          />
          <path
            d={isProcessing ? "M110,102 Q126,95 142,102" : "M110,107 Q126,101 142,107"}
            stroke="#2a1540" strokeWidth="2.5" fill="none" strokeLinecap="round"
          />

          {/* ── Left eye ── */}
          <g className={`av-eye av-eye-l av-eye-${state}`}>
            <ellipse cx="74" cy="127" rx="16" ry={eyeRy} fill="white" />
            <ellipse cx="74" cy="127" rx="10" ry={Math.max(eyeRy - 3, 3)} fill="#7b4abf" />
            <circle cx="74" cy="127" r={isListening ? 5 : 4} fill="#130a24" />
            <circle cx="70" cy="122" r="2.5" fill="white" opacity="0.9" />
            {isProcessing && (
              <circle cx="74" cy="127" r="12" fill="none" stroke="#c77dff"
                strokeWidth="1.2" opacity="0.7" className="av-swirl-l" />
            )}
          </g>

          {/* ── Right eye ── */}
          <g className={`av-eye av-eye-r av-eye-${state}`}>
            <ellipse cx="126" cy="127" rx="16" ry={eyeRy} fill="white" />
            <ellipse cx="126" cy="127" rx="10" ry={Math.max(eyeRy - 3, 3)} fill="#7b4abf" />
            <circle cx="126" cy="127" r={isListening ? 5 : 4} fill="#130a24" />
            <circle cx="122" cy="122" r="2.5" fill="white" opacity="0.9" />
            {isProcessing && (
              <circle cx="126" cy="127" r="12" fill="none" stroke="#c77dff"
                strokeWidth="1.2" opacity="0.7" className="av-swirl-r" />
            )}
          </g>

          {/* ── Nose ── */}
          <path d="M96,150 Q100,155 104,150" stroke="#c4a98a" strokeWidth="1.5" fill="none" strokeLinecap="round" />

          {/* ── Mouth ── */}
          <path
            className={isSpeaking ? 'av-mouth-speak' : ''}
            d={
              isSpeaking   ? "M88,169 Q100,176 112,169" :
              isListening  ? "M88,169 Q100,173 112,169" :
              isProcessing ? "M90,170 Q100,168 110,170"  :
                             "M90,169 Q100,171 110,169"
            }
            stroke="#c4547a" strokeWidth="2.2" fill="none" strokeLinecap="round"
          />

          {/* ── Blush ── */}
          {(isListening || isSpeaking) && (
            <>
              <ellipse cx="66" cy="142" rx="10" ry="6" fill="#ffb8c8" opacity="0.45" />
              <ellipse cx="134" cy="142" rx="10" ry="6" fill="#ffb8c8" opacity="0.45" />
            </>
          )}

          {/* ── Neck ── */}
          <rect x="85" y="202" width="30" height="18" rx="4" fill="#f2e8d8" />

          {/* ── Collar / clothes ── */}
          <path d="M50,214 L76,202 L100,220 L124,202 L150,214 L158,240 L42,240 Z" fill="#1a0d2e" />
          <path d="M76,202 L100,220 L124,202" stroke="#9d4edd" strokeWidth="1.5" fill="none" />
        </svg>

        {/* Floating particles when active */}
        {(isListening || isSpeaking) && (
          <div className="av-particles">
            <span className="av-p av-p1" />
            <span className="av-p av-p2" />
            <span className="av-p av-p3" />
          </div>
        )}
      </div>

      <style>{`
        .av-wrap {
          position: relative;
          width: 160px;
          height: 192px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* ── Aura rings ── */
        .av-aura {
          position: absolute;
          border-radius: 50%;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.5s;
        }
        .av-aura-1 { inset: -16px; }
        .av-aura-2 { inset: -32px; }

        .av-idle .av-aura-1    { opacity: 0.15; box-shadow: 0 0 24px #4a4a6a; }
        .av-listening .av-aura-1 { opacity: 1; box-shadow: 0 0 36px #9d4edd99; animation: av-pulse 2s ease-in-out infinite; }
        .av-listening .av-aura-2 { opacity: 0.4; box-shadow: 0 0 60px #9d4edd44; animation: av-pulse 2s ease-in-out infinite 0.3s; }
        .av-processing .av-aura-1 { opacity: 1; box-shadow: 0 0 36px #c77dff88; animation: av-spin 3s linear infinite; }
        .av-processing .av-aura-2 { opacity: 0.35; box-shadow: 0 0 70px #c77dff33; animation: av-spin 5s linear infinite reverse; }
        .av-speaking .av-aura-1 { opacity: 1; box-shadow: 0 0 40px #e0aaff88; animation: av-pulse 0.8s ease-in-out infinite; }
        .av-speaking .av-aura-2 { opacity: 0.5; box-shadow: 0 0 70px #e0aaff33; animation: av-pulse 0.8s ease-in-out infinite 0.2s; }

        @keyframes av-pulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.08); }
        }
        @keyframes av-spin {
          to { transform: rotate(360deg); }
        }

        /* ── SVG base ── */
        .av-svg {
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5));
          transition: filter 0.4s;
        }
        .av-idle      .av-svg { animation: av-idle-float 5s ease-in-out infinite; }
        .av-listening .av-svg {
          filter: drop-shadow(0 0 10px rgba(157,78,221,0.55));
          animation: av-breathe 2.5s ease-in-out infinite;
        }
        .av-processing .av-svg {
          filter: drop-shadow(0 0 12px rgba(199,125,255,0.5));
          animation: av-think 1.5s ease-in-out infinite;
        }
        .av-speaking .av-svg {
          filter: drop-shadow(0 0 14px rgba(224,170,255,0.65));
          animation: av-breathe 0.6s ease-in-out infinite;
        }

        @keyframes av-idle-float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-5px); }
        }
        @keyframes av-breathe {
          0%, 100% { transform: scale(1) translateY(0); }
          50%       { transform: scale(1.025) translateY(-2px); }
        }
        @keyframes av-think {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33%       { transform: translateY(-3px) rotate(-0.8deg); }
          66%       { transform: translateY(-1px) rotate(0.8deg); }
        }

        /* ── Eye blink for idle ── */
        .av-idle .av-eye { animation: av-blink 6s ease-in-out infinite; }
        @keyframes av-blink {
          0%, 45%, 55%, 100% { transform: scaleY(1); }
          50%                 { transform: scaleY(0.08); }
        }
        .av-eye-l { transform-origin: 74px 127px; }
        .av-eye-r { transform-origin: 126px 127px; }

        /* ── Processing swirl ── */
        .av-swirl-l {
          transform-origin: 74px 127px;
          animation: av-swirl-cw 1.2s linear infinite;
        }
        .av-swirl-r {
          transform-origin: 126px 127px;
          animation: av-swirl-ccw 1.2s linear infinite;
        }
        @keyframes av-swirl-cw  { to { transform: rotate(360deg); } }
        @keyframes av-swirl-ccw { to { transform: rotate(-360deg); } }

        /* ── Speaking mouth bounce ── */
        .av-mouth-speak {
          animation: av-mouth 0.35s ease-in-out infinite alternate;
          transform-origin: 100px 172px;
        }
        @keyframes av-mouth {
          from { transform: scaleY(1); }
          to   { transform: scaleY(1.6); }
        }

        /* ── Floating particles ── */
        .av-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 2;
        }
        .av-p {
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #9d4edd;
          animation: av-float 2.2s ease-in-out infinite;
          opacity: 0;
        }
        .av-speaking .av-p { background: #e0aaff; }
        .av-p1 { top: 25%; left: 8%;  animation-delay: 0s; }
        .av-p2 { top: 45%; right: 6%; animation-delay: 0.75s; }
        .av-p3 { bottom: 22%; left: 14%; animation-delay: 1.5s; }

        @keyframes av-float {
          0%   { opacity: 0; transform: translateY(0) scale(0.4); }
          40%  { opacity: 0.85; }
          100% { opacity: 0; transform: translateY(-36px) scale(0.8); }
        }
      `}</style>
    </>
  )
}
