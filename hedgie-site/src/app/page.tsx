"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Inter } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import {
  BotMessageSquare,
  Send,
  Wallet,
  Rocket,
  Lock,
  ArrowRight,
} from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

/* -------------------------------------------------------------------------- */
/*                                   THEME                                    */
/* -------------------------------------------------------------------------- */
const setBrandTheme = () => {
  const r = document.documentElement.style;
  r.setProperty("--bg", "#F7FAFD");
  r.setProperty("--surface", "#FFFFFF");
  r.setProperty("--muted", "#F1F6FB");
  r.setProperty("--outline", "#E6EEF6");
  r.setProperty("--ink", "#0F172A");
  r.setProperty("--text", "#334155"); 

  // Hedgie branding colors
  r.setProperty("--primary", "#229ED9"); // Telegram blue
  r.setProperty("--teal", "#13E6D2");    // circuitry teal
  r.setProperty("--navy", "#0D3156");    // deep navy
  r.setProperty("--navy2", "#13426E");   // ocean navy
  r.setProperty("--warm", "#FFB44F");    // accent
};

const cx = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

/* -------------------------------------------------------------------------- */
/*                         FEATURES / COMMAND DEFINITIONS                      */
/* -------------------------------------------------------------------------- */
type FeatureKey = "register" | "send" | "launch" | "stake";

interface Feature {
  key: FeatureKey;
  label: string;
  title: string;
  desc: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  userLine: string;
  botReply: string;
  accent: string; 
}

const FEATURES: Feature[] = [
  {
    key: "register",
    label: "/register",
    title: "Create a wallet, instantly",
    desc:
      "Spin up a self-custodial wallet right inside chat — no installs, no seed phrases. Hedgie guides recovery setup, safety checks, and your first steps so you’re productive in seconds.",
    icon: Wallet,
    userLine: "Hey Hedgie, /register me",
    botReply:
      "Wallet created ✅\nAddress: 0x4c…ed9\nNetwork: Hedera\nRecovery options: /settings",
    accent: "var(--primary)",
  },
  {
    key: "send",
    label: "/send",
    title: "Send & receive with confidence",
    desc:
      "Transfer stablecoins or HBAR with tiny fees and clear receipts. Hedgie confirms amounts and recipients, then links the transaction to the explorer for easy verification.",
    icon: Send,
    userLine: "Send 10 USDC to @mia",
    botReply: "Sent 10 USDC to @mia 💸\nTxn: 0x8f…a21\nView on explorer →",
    accent: "var(--teal)",
  },
  {
    key: "launch",
    label: "/launchToken",
    title: "Launch a community token",
    desc:
      "Create a token for your group in a few messages. Define name, ticker, supply, and airdrop rules — then enable quests, badges, tipping, and gated channels.",
    icon: Rocket,
    userLine: "Launch $VIBES token for our group",
    botReply:
      "$VIBES created 🎉\nSupply: 1,000,000\nTicker: VIBES\nTry /airdrop 100 VIBES",
    accent: "var(--navy2)",
  },
  {
    key: "stake",
    label: "/stake",
    title: "Stake to grow balances",
    desc:
      "Lock tokens to earn transparent, on-chain rewards. Hedgie tracks yields, unlock dates, and reminders — keeping complex math out of your way.",
    icon: Lock,
    userLine: "Stake 250 HBAR",
    botReply: "Staked 250 HBAR 🌱\nAPY: 7.4%\nUnstake: /unstake",
    accent: "var(--warm)",
  },
];

/* -------------------------------------------------------------------------- */
/*                             SHARED: Hedgie Avatar                           */
/* -------------------------------------------------------------------------- */
function HedgieAvatar({ size = 36 }: { size?: number }) {
  return (
    <div
      className="relative overflow-hidden rounded-full ring-1 ring-[color:var(--outline)] bg-[color:var(--muted)]"
      style={{ width: size, height: size }}
    >
      <Image
        src="/hedgie.png"
        alt="Hedgie"
        fill
        sizes={`${size}px`}
        className="object-cover"
        priority
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  UTIL                                      */
/* -------------------------------------------------------------------------- */
const nowTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

type Msg = {
  id: string;
  role: "user" | "bot";
  text: string;
  at: string;
  accent?: string;
};

/* -------------------------------------------------------------------------- */
/*                           PHONE FRAME (REUSABLE)                            */
/* -------------------------------------------------------------------------- */
function PhoneFrame({
  width,
  height,
  children,
  tilt = -2,
}: {
  width: number;
  height: number;
  children: React.ReactNode;
  tilt?: number;
}) {
  return (
    <motion.div
      initial={{ rotate: tilt, y: 10, opacity: 0 }}
      animate={{ rotate: tilt, y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
      className="relative"
      style={{ width: width + 44, height: height + 44 }}
    >
      <div
        className="relative mx-auto rounded-[46px] ring-1 ring-black/10 shadow-[0_40px_120px_-40px_rgba(13,49,86,0.5)]"
        style={{
          width,
          height,
          background:
            "linear-gradient(160deg, rgba(19,230,210,0.25), rgba(34,158,217,0.25))",
        }}
      >
        <div className="absolute inset-0 rounded-[46px] bg-black/5 pointer-events-none" />
        <div className="absolute left-1/2 top-5 -translate-x-1/2 h-24 w-48 rounded-3xl bg-black/80" />
        <div className="absolute -left-1 top-28 h-24 w-1.5 rounded-r bg-black/25" />
        <div className="absolute -right-1 top-24 h-14 w-1.5 rounded-l bg-black/25" />

        {/* Screen */}
        <div
          className="absolute inset-[16px] overflow-hidden rounded-[32px] bg-white"
          style={{
            background: "linear-gradient(180deg, #F8FBFF 0%, #EEF5FB 100%)",
          }}
        >
          {children}
        </div>
      </div>

      {/* gentle float */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               CHAT BUBBLES                                 */
/* -------------------------------------------------------------------------- */
function BotBubble({
  text,
  accent,
  at,
  light,
  avatarSize = 36,
  textSizeClass = "text-[17px]",
}: {
  text: string;
  accent: string;
  at: string;
  light?: boolean;
  avatarSize?: number;
  textSizeClass?: string;
}) {
  return (
    <div className="flex items-start gap-8">
      <div className="mt-0.5">
        <HedgieAvatar size={avatarSize} />
      </div>
      <div className="max-w-[78%]">
        <div
          className={cx(
            "rounded-2xl rounded-tl-sm border px-4 py-3 leading-7",
            textSizeClass,
            light
              ? "border-slate-200 bg-white text-slate-900"
              : "border-[color:var(--outline)] bg-[#0F1A36] text-slate-50"
          )}
        >
          <pre className="whitespace-pre-wrap font-sans">{text}</pre>
        </div>
        <div className="mt-1 text-[12px] font-medium" style={{ color: accent }}>
          {at}
        </div>
      </div>
    </div>
  );
}

function UserBubble({
  text,
  at,
  light,
  textSizeClass = "text-[17px]",
}: {
  text: string;
  at: string;
  light?: boolean;
  textSizeClass?: string;
}) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[78%] text-right">
        <div
          className={cx(
            "rounded-2xl rounded-tr-sm px-4 py-3 leading-7 text-white shadow",
            textSizeClass,
            light ? "bg-[color:var(--primary)]" : "bg-sky-600/90"
          )}
        >
          {text}
        </div>
        <div className="mt-1 text-[12px] font-medium text-slate-500">{at}</div>
      </div>
    </div>
  );
}

function TypingDots({ visible, light }: { visible: boolean; light?: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-start gap-8"
        >
          <div className="mt-0.5">
            <HedgieAvatar size={36} />
          </div>
          <div
            className={cx(
              "flex gap-2 rounded-2xl rounded-tl-sm border px-4 py-3",
              light ? "border-slate-200 bg-white" : "border-[color:var(--outline)] bg-[#0F1A36]"
            )}
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-2 w-2 rounded-full"
                style={{ background: "var(--navy2)" }}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */
export default function Page() {
  useEffect(() => {
    setBrandTheme();
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  return (
    <div
      className={cx(
        inter.className,
        "min-h-screen bg-[color:var(--bg)] text-[color:var(--text)]",
        "bg-[radial-gradient(60%_60%_at_10%_10%,rgba(34,158,217,0.10),transparent),radial-gradient(50%_50%_at_90%_15%,rgba(19,230,210,0.08),transparent)]"
      )}
    >
      <Navbar />
      <Hero />
      <FeaturesSection />
      <HowItWorks />
      <Faq />
      <Footer />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  NAVBAR                                    */
/* -------------------------------------------------------------------------- */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cx(
        "sticky top-0 z-40 w-full transition-all",
        scrolled
          ? "backdrop-blur bg-white/75 border-b border-[color:var(--outline)]"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <a href="#" className="flex items-center gap-4">
          <div className="relative">
            <span
              className="block h-12 w-12 rounded-2xl"
              style={{ background: "var(--primary)" }}
            />
            <BotMessageSquare className="absolute -right-3 -top-3 h-6 w-6 text-[color:var(--teal)]" />
          </div>
          <span className="text-3xl font-bold text-[color:var(--ink)]">
            Hedgie
          </span>
        </a>

        <div className="hidden md:flex items-center gap-10 text-xl">
          <a href="#features" className="hover:text-[color:var(--ink)]">
            Features
          </a>
          <a href="#how" className="hover:text-[color:var(--ink)]">
            How it works
          </a>
          <a href="#faq" className="hover:text-[color:var(--ink)]">
            FAQ
          </a>
        </div>

        <a
          href="https://t.me/"
          className="rounded-2xl bg-[color:var(--primary)] px-5 py-3 text-xl font-semibold text-white shadow-sm hover:shadow-[0_0_0_6px_rgba(34,158,217,0.15)]"
        >
          Try on Telegram
        </a>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   HERO                                     */
/* -------------------------------------------------------------------------- */
function Hero() {
  return (
    <section className="relative overflow-hidden py-24 scroll-mt-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-24 px-6 md:grid-cols-2">
        {/* LEFT */}
        <div className="order-2 md:order-1">
          <div className="flex items-center gap-6">
            <div className="relative h-40 w-40 overflow-hidden rounded-3xl ring-4 ring-[color:var(--outline)]">
              <Image
                src="/hedgie.png"
                alt="Hedgie mascot"
                fill
                className="object-cover"
                sizes="160px"
                priority
              />
            </div>
            <span className="rounded-full border border-[color:var(--outline)] bg-[color:var(--surface)] px-4 py-2 text-lg font-medium text-slate-600">
              Built on Hedera • Telegram Ready
            </span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-8 text-8xl md:text-9xl font-black tracking-tight text-[color:var(--ink)]"
          >
            Meet <span className="text-[color:var(--primary)]">Hedgie</span>
          </motion.h1>

          <p className="mt-6 text-2xl leading-9 max-w-2xl">
            Your Web3 buddy on chat. Create wallets, send crypto, launch
            community tokens, gift NFTs, and stake — all in one conversation.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="https://t.me/"
              className="inline-flex items-center rounded-2xl bg-[color:var(--primary)] px-6 py-4 text-2xl font-semibold text-white"
            >
              Say hi on Telegram <ArrowRight className="ml-3 h-6 w-6" />
            </a>
            <a
              href="#features"
              className="inline-flex items-center rounded-2xl border border-[color:var(--outline)] bg-[color:var(--surface)] px-6 py-4 text-2xl font-semibold"
            >
              Explore features
            </a>
          </div>
        </div>

        {/* RIGHT: Large looping phone */}
        <div className="order-1 md:order-2 flex justify-center md:justify-end">
          <HeroPhoneDemo />
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- HERO PHONE DEMO ------------------------------ */
const HERO_W = 460;
const HERO_H = 960;

function HeroPhoneDemo() {
  const steps = useMemo(
    () =>
      [
        { user: "Hey Hedgie, /register me", bot: "Wallet created ✅  Address: 0x4c…ed9  Network: Hedera", accent: "var(--primary)" },
        { user: "Send 10 USDC to @mia", bot: "Sent 10 USDC to @mia 💸  Txn: 0x8f…a21", accent: "var(--teal)" },
        { user: "Launch $VIBES token for our group", bot: "$VIBES created 🎉  Supply: 1,000,000", accent: "var(--navy2)" },
        { user: "Stake 250 HBAR", bot: "Staked 250 HBAR 🌱  APY: 7.4%", accent: "var(--warm)" },
      ] as const,
    []
  );

  const [messages, setMessages] = useState<Msg[]>([
    { id: "m0", role: "bot", text: "Welcome! Try /register, /send, /launchToken, /stake", at: nowTime(), accent: "var(--primary)" },
  ]);
  const [typing, setTyping] = useState(false);
  const stepRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = () => {
      const s = steps[stepRef.current % steps.length];
      setMessages((p) => [...p, { id: crypto.randomUUID(), role: "user", text: s.user, at: nowTime() }]);
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setMessages((p) => [...p, { id: crypto.randomUUID(), role: "bot", text: s.bot, at: nowTime(), accent: s.accent as string }]);
        stepRef.current += 1;
      }, 1200);
    };
    const init = setTimeout(tick, 600);
    const interval = setInterval(tick, 3600);
    return () => { clearTimeout(init); clearInterval(interval); };
  }, [steps]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  return (
    <PhoneFrame width={HERO_W} height={HERO_H}>
      <div className="flex items-center justify-between px-6 pt-7 text-base text-slate-600">
        <span>
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </span>
        <span className="font-semibold" style={{ color: "var(--navy2)" }}>
          WhatsApp·Hedgie
        </span>
      </div>
      <div ref={scrollRef} className="h-full overflow-y-auto px-5 pb-8 pt-3">
        <div className="mt-6 flex flex-col gap-6">
          {messages.map((m) =>
            m.role === "bot" ? (
              <BotBubble key={m.id} text={m.text} accent={m.accent ?? "var(--primary)"} at={m.at} light textSizeClass="text-[20px]" />
            ) : (
              <UserBubble key={m.id} text={m.text} at={m.at} light textSizeClass="text-[20px]" />
            )
          )}
          <TypingDots visible={typing} light />
        </div>
      </div>
    </PhoneFrame>
  );
}

/* -------------------------------------------------------------------------- */
/*                             FEATURES (SECTION)                              */
/* -------------------------------------------------------------------------- */
function FeaturesSection() {
  const [active, setActive] = useState<FeatureKey>("register");

  return (
    <section id="features" className="pb-28 pt-10 scroll-mt-32">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <span
          className="inline-flex items-center gap-3 rounded-full border border-[color:var(--outline)] bg-[color:var(--surface)] px-4 py-2 text-xl font-semibold"
          style={{ color: "var(--navy2)" }}
        >
          Features
        </span>
        <h2 className="mt-6 text-7xl md:text-8xl font-extrabold tracking-tight text-[color:var(--ink)]">
          From sending to staking - Hedgie handles it all!
        </h2>
        <p className="mx-auto mt-5 max-w-5xl text-2xl leading-9">
          Hedgie brings the power of Web3 to your conversations — helping you send value, grow communities, and build savings stories in one chat.
        </p>
      </div>

      <div className="mx-auto mt-20 grid max-w-7xl grid-cols-1 items-start gap-20 px-6 md:grid-cols-2">
        {/* Left: phone demo bound to active feature */}
        <FeaturePhoneDemo active={active} />

        {/* Right: controls + details */}
        <div className="text-left">
          <div className="flex flex-wrap gap-4">
            {FEATURES.map((f) => (
              <button
                key={f.key}
                onClick={() => setActive(f.key)}
                className={cx(
                  "flex items-center gap-3 rounded-2xl border px-5 py-4 text-2xl font-semibold",
                  active === f.key
                    ? "border-transparent text-white shadow-sm"
                    : "border-[color:var(--outline)] bg-[color:var(--surface)] hover:bg-white"
                )}
                style={
                  active === f.key
                    ? { background: "linear-gradient(90deg, var(--primary), var(--teal))" }
                    : undefined
                }
              >
                <f.icon className="h-7 w-7" />
                {f.label}
              </button>
            ))}
          </div>

          <FeatureDetail key={active} feature={FEATURES.find((f) => f.key === active)!} />
        </div>
      </div>
    </section>
  );
}

function FeatureDetail({ feature }: { feature: Feature }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="mt-10"
    >
      <h3 className="text-4xl md:text-5xl font-bold text-[color:var(--ink)]">
        {feature.title}
      </h3>
      <p className="mt-4 text-2xl leading-9 max-w-3xl">{feature.desc}</p>
    </motion.div>
  );
}

/* ------------------------ FEATURES PHONE DEMO (SYNC) ----------------------- */
const FEAT_W = 420;
const FEAT_H = 900;

function FeaturePhoneDemo({ active }: { active: FeatureKey }) {
  const feat = FEATURES.find((f) => f.key === active)!;

  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "intro",
      role: "bot",
      text: "Welcome! Try /register, /send, /launchToken, /stake",
      at: nowTime(),
      accent: "var(--primary)",
    },
  ]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Restart the mini loop whenever active changes
  useEffect(() => {
    setMessages([
      {
        id: "intro",
        role: "bot",
        text: "Welcome! Try /register, /send, /launchToken, /stake",
        at: nowTime(),
        accent: "var(--primary)",
      },
    ]);

    const t1 = setTimeout(() => {
      setMessages((p) => [...p, { id: crypto.randomUUID(), role: "user", text: feat.userLine, at: nowTime() }]);
      setTyping(true);

      const t2 = setTimeout(() => {
        setTyping(false);
        setMessages((p) => [
          ...p,
          {
            id: crypto.randomUUID(),
            role: "bot",
            text: feat.botReply,
            at: nowTime(),
            accent: feat.accent,
          },
        ]);
      }, 1200);

      return () => clearTimeout(t2);
    }, 600);

    return () => clearTimeout(t1);
  }, [active, feat.userLine, feat.botReply, feat.accent]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  return (
    <PhoneFrame width={FEAT_W} height={FEAT_H} tilt={-1}>
      <div className="flex items-center justify-between px-6 pt-7 text-base text-slate-600">
        <span>
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </span>
        <span className="font-semibold" style={{ color: "var(--navy2)" }}>
          WhatsApp·Hedgie
        </span>
      </div>

      <div ref={scrollRef} className="h-full overflow-y-auto px-5 pb-8 pt-3">
        <div className="mt-6 flex flex-col gap-6">
          {messages.map((m) =>
            m.role === "bot" ? (
              <BotBubble key={m.id} text={m.text} accent={m.accent ?? "var(--primary)"} at={m.at} light textSizeClass="text-[20px]" />
            ) : (
              <UserBubble key={m.id} text={m.text} at={m.at} light textSizeClass="text-[20px]" />
            )
          )}
          <TypingDots visible={typing} light />
        </div>
      </div>
    </PhoneFrame>
  );
}

/* -------------------------------------------------------------------------- */
/*                               HOW IT WORKS                                 */
/* -------------------------------------------------------------------------- */
function HowItWorks() {
  const steps = [
    {
      icon: BotMessageSquare,
      title: "Start a chat with Hedgie",
      body:
        "Say hello on Telegram. Hedgie sets up a secure session and offers smart prompts so you can explore features at your own pace.",
    },
    {
      icon: Wallet,
      title: "Get a wallet with recovery",
      body:
        "Create a self-custodial wallet in seconds, with simple recovery and safety guardrails — explained in plain language.",
    },
    {
      icon: Send,
      title: "Transact, launch, and stake",
      body:
        "Send value, spin up tokens, run airdrops, and stake — all with confirmations, receipts, and explorer links in the conversation.",
    },
  ];

  return (
    <section id="how" className="py-32 scroll-mt-32">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <h2 className="text-7xl md:text-8xl font-extrabold tracking-tight text-[color:var(--ink)]">
          How it works
        </h2>

        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="rounded-3xl border border-[color:var(--outline)] bg-[color:var(--surface)] p-10 text-left shadow-sm"
            >
              <div
                className="grid h-20 w-20 place-items-center rounded-2xl"
                style={{ background: "linear-gradient(135deg,var(--muted),#EAF5FF)" }}
              >
                <s.icon className="h-10 w-10" style={{ color: "var(--primary)" }} />
              </div>
              <h3 className="mt-5 text-4xl font-semibold text-[color:var(--ink)]">
                {s.title}
              </h3>
              <p className="mt-3 text-2xl leading-9">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    FAQ                                     */
/* -------------------------------------------------------------------------- */
function Faq() {
  const items = [
    {
      q: "Is Hedgie self-custodial?",
      a: "Yes. Keys are created for you with recovery options. You stay in control while enjoying chat-native UX.",
    },
    {
      q: "Which chains are supported?",
      a: "Powered by Hedera for speed, low cost, and transparency.",
    },
    {
      q: "Does this work in groups?",
      a: "Absolutely — tipping, token launches, leaderboards, and quests thrive in Telegram groups.",
    },
  ];
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-32 scroll-mt-32">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-7xl font-extrabold tracking-tight text-[color:var(--ink)] text-center">
          FAQ
        </h2>
        <div className="mt-12 divide-y divide-[color:var(--outline)] rounded-3xl border border-[color:var(--outline)] bg-[color:var(--surface)]">
          {items.map((it, i) => (
            <div key={i} className="p-8">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="text-3xl font-semibold text-[color:var(--ink)]">
                  {it.q}
                </span>
                <motion.span animate={{ rotate: open === i ? 90 : 0 }}>
                  <ArrowRight className="h-8 w-8 text-slate-400" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden pt-3 text-2xl leading-9"
                  >
                    {it.a}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   FOOTER                                   */
/* -------------------------------------------------------------------------- */
function Footer() {
  return (
    <footer className="border-t border-[color:var(--outline)] py-16 text-center text-xl text-slate-500">
      © {new Date().getFullYear()} Hedgie — Built with ❤️ on Hedera
    </footer>
  );
}
