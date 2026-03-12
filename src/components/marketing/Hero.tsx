import { Container } from "./Container";
import { Badge } from "./Badge";
import { CTAButton } from "./CTAButton";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f0f4ff] via-[#f8faff] to-white min-h-[90vh] flex items-center">
      {/* Animated decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-[10%] w-[500px] h-[500px] bg-primary/[0.05] rounded-full blur-[100px] animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute top-40 right-[5%] w-[600px] h-[600px] bg-[#4f9cf7]/[0.04] rounded-full blur-[120px] animate-[float_10s_ease-in-out_infinite_reverse]" />
        <div className="absolute -bottom-20 left-[30%] w-[400px] h-[400px] bg-primary/[0.03] rounded-full blur-[80px] animate-[float_12s_ease-in-out_infinite_2s]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(11,92,186,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(11,92,186,0.4) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          }}
        />

        {/* Shimmer lines */}
        <div className="absolute top-[20%] left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-[shimmer_4s_ease-in-out_infinite]" />
        <div className="absolute top-[80%] left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-[shimmer_6s_ease-in-out_infinite_reverse]" />

        {/* Floating shapes */}
        <div className="absolute top-[15%] right-[15%] w-3 h-3 bg-primary/20 rounded-full animate-[float_6s_ease-in-out_infinite]" />
        <div className="absolute top-[65%] left-[12%] w-2 h-2 bg-primary/15 rounded-full animate-[float_8s_ease-in-out_infinite_1s]" />
        <div className="absolute top-[35%] left-[8%] w-4 h-4 border border-primary/10 rounded-sm rotate-45 animate-[float_10s_ease-in-out_infinite_2s]" />
        <div className="absolute top-[50%] right-[10%] w-3 h-3 border border-primary/10 rounded-full animate-[float_7s_ease-in-out_infinite_0.5s]" />

        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent" />
      </div>

      <Container className="relative text-center py-32 md:py-44 lg:py-52">
        <div className="animate-[hero-fade-in_0.7s_ease-out_0.1s_both]">
          <Badge>WEB施工証明書SaaS</Badge>
        </div>

        <h1 className="mt-8">
          <span className="block text-[2.25rem] md:text-[3.5rem] lg:text-[4rem] font-bold leading-[1.15] tracking-tight text-heading animate-[hero-fade-up_0.8s_ease-out_0.25s_both]">
            施工証明をデジタルで。
          </span>
          <span className="block text-[2.25rem] md:text-[3.5rem] lg:text-[4rem] font-bold leading-[1.15] tracking-tight bg-gradient-to-r from-primary via-[#2b7de9] to-[#4f9cf7] bg-clip-text text-transparent animate-[hero-fade-up_0.8s_ease-out_0.45s_both]">
            信頼を、かんたんに。
          </span>
        </h1>

        <p className="mt-8 text-lg md:text-xl leading-relaxed text-body/70 max-w-2xl mx-auto animate-[hero-fade-up_0.8s_ease-out_0.65s_both]">
          CARTRUSTは、自動車の施工記録をデジタル証明書として発行・管理できるプラットフォームです。
          施工店の業務効率化と、保険会社の査定精度向上を同時に実現します。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 animate-[hero-fade-up_0.8s_ease-out_0.85s_both]">
          <CTAButton variant="primary" href="/contact">
            無料で始める
          </CTAButton>
          <CTAButton variant="outline" href="/contact">
            資料請求
          </CTAButton>
        </div>

        <p className="mt-16 text-sm text-muted animate-[hero-fade-in_0.7s_ease-out_1.1s_both]">
          すでに
          <span className="font-semibold text-heading">500社以上</span>
          の施工店・保険会社にご利用いただいています
        </p>
      </Container>
    </section>
  );
}
